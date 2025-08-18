from fastapi import APIRouter, HTTPException, status, Body, Response, Path
from ....db.session import SessionDep

from .payment_service import PaymentService


router = APIRouter()

@router.post("/mpesa/qr-intents", status_code=status.HTTP_201_CREATED)
async def create_mpesa_qr_intent(
    response: Response,
    db: SessionDep,
    amount: float = Body(..., gt=0, description="Amount for the M-Pesa QR payment"),
    phone_number: str = Body(..., min_length=10, max_length=15, description="Customer's phone number for M-Pesa QR payment")
):
    """
    Create a new M-Pesa QR payment intent.
    """
    service = PaymentService(db)
    
    result = await service.create_mpesa_qr_intent(amount, phone_number)
    
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
):
    """
    Get the status of an M-Pesa QR payment.
    """
    service = PaymentService(db)
    
    result = await service.get_mpesa_qr_status(transaction_id)
    
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
):
    """
    Retrieve an M-Pesa QR payment intent by its ID.
    """
    service = PaymentService(db)
    
    result = await service.get_mpesa_qr_intent(intent_id)
    
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.error
        )
    
    return result.data