from fastapi import APIRouter, HTTPException, status, Path, Query, Depends, Request
from typing import List, Optional
from ...db.session import SessionDep
from .sales_model import (
    SalesRequestBody, SaleResponse, STKPushRequest, STKPushResponse,
    STKPushStatusResponse
)
from .sales_service import SalesService
from .payment_tracking_service import PaymentTrackingService
from ...utils.auth import (
    require_role,
    require_permission,
    CurrentUser,
    UserRole,
    Permission
)
from ...utils.kcb_buni import (
    format_phone_number,
    initiate_stk_push,
)
import uuid
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter()

def _extract_stk_ids(stk_response: dict, invoice_number: str) -> tuple[str, Optional[str]]:
    """Extract checkout and merchant request IDs from multiple provider response shapes."""
    response_block = stk_response.get("response", {}) if isinstance(stk_response, dict) else {}
    checkout_request_id = (
        stk_response.get("CheckoutRequestID")
        or stk_response.get("checkoutRequestID")
        or response_block.get("CheckoutRequestID")
        or response_block.get("checkoutRequestID")
        or invoice_number
    )
    merchant_request_id = (
        stk_response.get("MerchantRequestID")
        or stk_response.get("merchantRequestID")
        or response_block.get("MerchantRequestID")
        or response_block.get("merchantRequestID")
    )
    return checkout_request_id, merchant_request_id


@router.post("/mpesa/stkpush", response_model=STKPushResponse, status_code=status.HTTP_200_OK)
async def initiate_mpesa_stkpush(
    db: SessionDep,
    stk_request: STKPushRequest,
    user: CurrentUser = Depends(require_permission(Permission.WRITE_SALES))
):
    """
    Initiate an M-Pesa STK Push payment via KCB Buni API.
    
    The phone number will be automatically formatted to 2547XXXXXXXX format.
    The sale payload is stored in the payments table and the sale is created
    only after successful callback confirmation.
    
    Requires: Write sales permission (Admin/Manager/Cashier)
    """
    payment_tracking_service = PaymentTrackingService(db)
    await payment_tracking_service.cleanup_expired_payments()

    try:
        # Format phone number
        formatted_phone = format_phone_number(stk_request.phone_number)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    try:
        invoice_number = f"INV-{uuid.uuid4().hex[:12].upper()}"

        # Initiate STK push via KCB Buni API
        stk_response = await initiate_stk_push(
            phone_number=formatted_phone,
            amount=str(stk_request.amount),
            invoice_number=invoice_number,
            transaction_description=f"Bookshop Sales"
        )

        checkout_request_id, merchant_request_id = _extract_stk_ids(stk_response, invoice_number)

        sale_data_snapshot = json.loads(stk_request.sale_data.model_dump_json())
        raw_request_json = {
            "phone_number": formatted_phone,
            "amount": str(stk_request.amount),
            "invoice_number": invoice_number,
            "checkout_request_id": checkout_request_id,
            "merchant_request_id": merchant_request_id,
            "stk_response": stk_response,
        }
        await payment_tracking_service.create_pending_mpesa_payment(
            tenant_id=user.tenant_id,
            amount=stk_request.amount,
            payment_method=stk_request.sale_data.payment.payment_method,
            invoice_number=invoice_number,
            checkout_request_id=checkout_request_id,
            sale_data_snapshot=sale_data_snapshot,
            raw_request_json=raw_request_json,
        )

        logger.info(
            "STK push initiated: invoice=%s checkout=%s merchant=%s",
            invoice_number,
            checkout_request_id,
            merchant_request_id,
        )

        return STKPushResponse(
            checkout_request_id=checkout_request_id,
            invoice_number=invoice_number,
            status="pending",
            message="STK push sent. Check your phone to complete payment."
        )

    except Exception as e:
        logger.error(f"STK push initiation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to initiate STK push: {str(e)}"
        )


@router.post("/mpesa/callback", status_code=status.HTTP_200_OK)
async def mpesa_callback(
    request: Request,
    db: SessionDep,
):
    """
    KCB Buni M-Pesa callback endpoint.
    
    This endpoint receives payment results from KCB after the customer
    completes (or declines) the STK push on their phone.
    
    No authentication required — this is called by KCB's servers.
    """
    try:
        payment_tracking_service = PaymentTrackingService(db)
        payment_repository = payment_tracking_service.repository
        callback_data = await request.json()
        logger.info(f"M-Pesa callback received: {callback_data}")

        # Extract stkCallback payload which is usually deeply nested
        stk_callback = callback_data.get("Body", {}).get("stkCallback", callback_data)

        # Extract basic fields safely (ResultCode 0 is success)
        result_code = stk_callback.get("resultCode") if "resultCode" in stk_callback else stk_callback.get("ResultCode")
        invoice_number = stk_callback.get("invoiceNumber") or stk_callback.get("InvoiceNumber") or stk_callback.get("BillRefNumber")
        
        # Find Transaction ID (MpesaReceiptNumber is usually in CallbackMetadata)
        transaction_id = stk_callback.get("transactionId") or stk_callback.get("TransactionID")
        if not transaction_id and "CallbackMetadata" in stk_callback:
            items = stk_callback.get("CallbackMetadata", {}).get("Item", [])
            for item in items:
                if item.get("Name") == "MpesaReceiptNumber":
                    transaction_id = item.get("Value")
                    break

        # Try to find the pending payment
        checkout_id = stk_callback.get("CheckoutRequestID") or stk_callback.get("checkoutRequestID")
        merchant_request_id = stk_callback.get("MerchantRequestID") or stk_callback.get("merchantRequestID")
        payment = await payment_tracking_service.find_payment_for_callback(
            checkout_request_id=checkout_id,
            invoice_number=str(invoice_number) if invoice_number else None,
            merchant_request_id=merchant_request_id,
        )

        if not payment:
            logger.warning(f"No pending payment found for callback: {callback_data}")
            return {"ResultCode": 0, "ResultDesc": "Accepted"}

        await payment_repository.mark_callback_received(payment, callback_data)

        if payment.status == "completed" and payment.sale_id:
            logger.info(
                f"Ignoring duplicate callback for completed payment: "
                f"payment_id={payment.id}, sale_id={payment.sale_id}"
            )
            return {"ResultCode": 0, "ResultDesc": "Accepted"}

        # Check if payment was successful (ResultCode 0 = success)
        if str(result_code) == "0":
            # Payment successful — create the sale in DB
            try:
                sale_data_dict = payment.sale_data_snapshot or {}
                tenant_id = payment.tenant_id

                # Reconstruct SalesRequestBody
                sale_request = SalesRequestBody(**sale_data_dict)

                service = SalesService(db)
                result = await service.create_sale(sale_request, tenant_id)

                if result.success:
                    sale_id = result.data["sale_id"]
                    await payment_repository.mark_completed(
                        payment=payment,
                        sale_id=sale_id,
                        provider_receipt=transaction_id,
                    )
                    logger.info(
                        f"M-Pesa sale created successfully: sale_id={sale_id}, "
                        f"invoice={payment.invoice_number}, checkout={payment.checkout_request_id}"
                    )
                else:
                    await payment_repository.mark_failed(
                        payment=payment,
                        reason=result.error or "Failed to create sale after payment confirmation",
                    )
                    logger.error(f"Failed to create sale from callback: {result.error}")
            except Exception as e:
                await payment_repository.mark_failed(payment=payment, reason=str(e))
                logger.error(f"Error creating sale from callback: {str(e)}")
        else:
            # Payment failed or cancelled
            result_desc = (
                stk_callback.get("resultDesc")
                or stk_callback.get("ResultDesc")
                or callback_data.get("resultDesc")
                or callback_data.get("ResultDesc")
                or "Payment failed"
            )
            await payment_repository.mark_failed(
                payment=payment,
                reason=result_desc,
                code=str(result_code) if result_code is not None else None,
            )
            logger.info(f"M-Pesa payment failed/cancelled: {result_desc}")

        # Acknowledge to KCB
        return {"ResultCode": 0, "ResultDesc": "Accepted"}

    except Exception as e:
        logger.error(f"Error processing M-Pesa callback: {str(e)}")
        return {"ResultCode": 0, "ResultDesc": "Accepted"}


@router.get("/mpesa/status/{invoice_number}", response_model=STKPushStatusResponse, status_code=status.HTTP_200_OK)
async def check_stk_push_status(
    db: SessionDep,
    invoice_number: str = Path(..., description="The invoice number"),
    user: CurrentUser = Depends(require_permission(Permission.WRITE_SALES))
):
    """
    Check the status of an STK Push payment.
    
    The frontend polls this endpoint to know when the payment has been
    confirmed (or failed) via the KCB callback.
    
    Requires: Write sales permission
    """
    payment_tracking_service = PaymentTrackingService(db)
    await payment_tracking_service.cleanup_expired_payments()

    payment = await payment_tracking_service.get_payment_status_by_lookup(
        invoice_number=invoice_number,
        tenant_id=user.tenant_id,
    )

    if payment:
        status_val = payment.status or "pending"
        message = None
        if status_val == "completed":
            message = "Payment confirmed. Sale recorded successfully."
        elif status_val == "failed":
            message = payment.failure_reason or "Payment failed."
        elif status_val == "expired":
            message = "Payment request expired. Please try again."
        else:
            message = "Waiting for payment confirmation..."

        return STKPushStatusResponse(
            checkout_request_id=payment.checkout_request_id or invoice_number,
            status=status_val,
            message=message,
            sale_id=payment.sale_id
        )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"No payment found for checkout request: {invoice_number}"
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_sale(
    db: SessionDep,
    sale_data: SalesRequestBody,
    user: CurrentUser = Depends(require_permission(Permission.WRITE_SALES))
):
    """
    Create a new sale.
    Requires: Write sales permission (Admin/Manager/Cashier)
    """
    service = SalesService(db)
    result = await service.create_sale(sale_data, user.tenant_id)
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
    return {"sale_id": result.data["sale_id"], "message": "Sale created successfully"}

@router.get("", response_model=List[SaleResponse])
async def list_sales(
    db: SessionDep,
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    payment_method: Optional[str] = Query(None),
    sale_status: Optional[str] = Query(None),
    limit: int = Query(100, gt=0, le=1000),
    user: CurrentUser = Depends(require_permission(Permission.READ_SALES))
):
    """
    Retrieve a list of sales with optional filters.
    Requires: Read sales permission
    """    
    try:
        
        service = SalesService(db)
        result = await service.get_sales_by_tenant(
            tenant_id=user.tenant_id,
            date_from=date_from,
            date_to=date_to,
            payment=payment_method,
            status=sale_status,
            limit=limit
        )
        
        if not result.success:
            print(f"Service failed with error: {result.error}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error
            )
        return result.data
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Unexpected error occurred while listing sales: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/dashboard-summary", status_code=status.HTTP_200_OK)
async def get_dashboard_summary(
    db: SessionDep,
    recent_limit: int = Query(5, gt=0, le=20),
    user: CurrentUser = Depends(require_permission(Permission.READ_SALES))
):
    """
    Get summary metrics and recent sales for the dashboard.
    Requires: Read sales permission
    """
    try:
        service = SalesService(db)
        result = await service.get_dashboard_summary(
            tenant_id=user.tenant_id,
            recent_limit=recent_limit
        )

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error
            )

        return result.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/reports-summary", status_code=status.HTTP_200_OK)
async def get_reports_summary(
    db: SessionDep,
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    user: CurrentUser = Depends(require_permission(Permission.READ_SALES))
):
    """
    Get aggregated sales report metrics for the current tenant.
    Requires: Read sales permission
    """
    try:
        service = SalesService(db)
        result = await service.get_reports_summary(
            tenant_id=user.tenant_id,
            date_from=date_from,
            date_to=date_to
        )

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error
            )

        return result.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/{sale_id}", response_model=SaleResponse)
async def get_sale(
    db: SessionDep,
    sale_id: str = Path(..., description="The ID of the sale"),
    user: CurrentUser = Depends(require_permission(Permission.READ_SALES))
):
    """
    Retrieve a sale by its ID.
    Requires: Read sales permission
    """
    try:
        service = SalesService(db)
        result = await service.get_sale_by_id(
            sale_id=uuid.UUID(sale_id),
            tenant_id=user.tenant_id
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.error
            )
        
        return result.data
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid sale ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/{sale_id}/receipt", status_code=status.HTTP_200_OK)
async def print_receipt(
    db: SessionDep,
    sale_id: str = Path(..., description="The ID of the sale"),
    user: CurrentUser = Depends(require_permission(Permission.READ_SALES))
):
    """
    Print a receipt for a sale.
    Requires: Read sales permission
    """
    try:
        service = SalesService(db)
        result = await service.print_receipt(
            sale_id=uuid.UUID(sale_id),
            tenant_id=user.tenant_id
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error
            )
        
        return {"message": "Receipt printed successfully"}
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid sale ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# Sales analytics endpoints - Admin/Manager only
@router.get("/analytics/summary", status_code=status.HTTP_200_OK)
async def get_sales_summary(
    db: SessionDep,
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    user: CurrentUser = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """
    Get sales summary analytics.
    Requires: Admin or Manager role
    """
    try:
        service = SalesService(db)
        result = await service.get_sales_summary(
            tenant_id=user.tenant_id,
            date_from=date_from,
            date_to=date_to
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error
            )
        
        return result.data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
