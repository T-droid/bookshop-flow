from fastapi import APIRouter, Body, HTTPException, status
from .tax_model import CreateTaxModel, UpdateTaxModel
from .tax_service import TaxService
from ...db.session import SessionDep


router = APIRouter()

@router.post('', status_code=status.HTTP_201_CREATED)
async def create_tax_rate(
    tax_rate: CreateTaxModel,
    db: SessionDep
):
    service = TaxService(db)
    result = await service.create_tax_rate(tax_rate)
    
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
    
    return {"id": result.data, "message": "Tax rate created successfully"}

@router.put('/{tax_rate_id}', status_code=status.HTTP_200_OK)
async def update_tax_rate(
    tax_rate_id: int,
    tax_rate: UpdateTaxModel,
    db: SessionDep
):
    service = TaxService(db)
    result = await service.update_tax_rate(tax_rate_id, tax_rate)
    
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
    
    return {"message": "Tax rate updated successfully", "data": result.data}