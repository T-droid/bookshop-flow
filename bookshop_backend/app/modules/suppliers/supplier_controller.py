from fastapi import APIRouter, Body, Response, status, HTTPException, Request
from .supplier_model import SupplierCreate
from .supplier_service import SupplierService
from ...db.session import SessionDep
import uuid


router = APIRouter()
@router.post('/', status_code=status.HTTP_201_CREATED)
async def create_supplier(
    response: Response,
    db: SessionDep,
    supplier: SupplierCreate = Body(...),
    ):
    service = SupplierService(db)
    supplier.tenant_id = uuid.UUID("6e439a65-0e33-4181-8773-7a48df2bdfdf")
    result = await service.create_supplier(supplier)
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
    response.headers["Location"] = f"/suppliers/{result.data}"
    return result.data