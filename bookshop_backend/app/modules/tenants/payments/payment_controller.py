from fastapi import APIRouter, HTTPException, status, Body, Response, Path, Depends
from ....db.session import SessionDep
from ....utils.auth import (
    get_current_user,
    require_role,
    require_permission,
    CurrentUser,
    UserRole,
    Permission
)

from .payment_service import PaymentService


router = APIRouter()

@router.post("/mpesa/qr-intents", status_code=status.HTTP_201_CREATED)
async def create_mpesa_qr_intent(
    response: Response,
    db: SessionDep,
    amount: float = Body(..., gt=0, description="Amount for the M-Pesa QR payment"),
    phone_number: str = Body(..., min_length=10, max_length=15, description="Customer's phone number for M-Pesa QR payment"),
    user: CurrentUser = Depends(require_permission(Permission.WRITE_SALES))  # Payment creation requires sales permission
):
    """
    Create a new M-Pesa QR payment intent.
    Requires: Write sales permission (Admin/Manager/Cashier)
    """
    service = PaymentService(db)
    
    result = await service.create_mpesa_qr_intent(
        amount=amount, 
        phone_number=phone_number,
        tenant_id=user.tenant_id,
        user_id=user.user_id
    )
    
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
    
    response.status_code = status.HTTP_201_CREATED
    return result.data

@router.get("/mpesa/qr-status/{transaction_id}", status_code=status.HTTP_200_OK)
async def get_mpesa_qr_status(
    db: SessionDep,
    transaction_id: str = Path(..., min_length=1, description="Transaction ID for the M-Pesa QR payment"),
    user: CurrentUser = Depends(require_permission(Permission.READ_SALES))
):
    """
    Get the status of an M-Pesa QR payment.
    Requires: Read sales permission
    """
    service = PaymentService(db)
    
    result = await service.get_mpesa_qr_status(
        transaction_id=transaction_id,
        tenant_id=user.tenant_id
    )
    
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.error
        )
    
    return result.data

@router.get("/mpesa/qr-intents/{intent_id}", status_code=status.HTTP_200_OK)
async def get_mpesa_qr_intent(
    db: SessionDep,
    intent_id: str = Path(..., min_length=1, description="Intent ID for the M-Pesa QR payment"),
    user: CurrentUser = Depends(require_permission(Permission.READ_SALES))
):
    """
    Retrieve an M-Pesa QR payment intent by its ID.
    Requires: Read sales permission
    """
    service = PaymentService(db)
    
    result = await service.get_mpesa_qr_intent(
        intent_id=intent_id,
        tenant_id=user.tenant_id
    )
    
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.error
        )
    
    return result.data

# Additional payment endpoints
@router.get("/", status_code=status.HTTP_200_OK)
async def get_payments(
    db: SessionDep,
    skip: int = 0,
    limit: int = 100,
    user: CurrentUser = Depends(require_permission(Permission.READ_SALES))
):
    """
    Get all payments for the current tenant.
    Requires: Read sales permission
    """
    try:
        service = PaymentService(db)
        result = await service.get_payments_by_tenant(
            tenant_id=user.tenant_id,
            skip=skip,
            limit=limit
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

@router.get("/analytics", status_code=status.HTTP_200_OK)
async def get_payment_analytics(
    db: SessionDep,
    user: CurrentUser = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """
    Get payment analytics for the current tenant.
    Requires: Admin or Manager role
    """
    try:
        service = PaymentService(db)
        result = await service.get_payment_analytics(user.tenant_id)
        
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