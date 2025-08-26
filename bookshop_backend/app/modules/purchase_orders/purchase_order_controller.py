from fastapi import APIRouter, Body, Response, status, HTTPException, Request, Depends
from typing import Annotated
from ...db.session import SessionDep
from .purchase_order_service import PurchaseOrderService
from .purchase_order_model import PurchaseOrderCreate, PurchaseOrderResponse
from ...utils.auth import (
    require_permission,
    require_role,
    Permission,
    CurrentUser,
)


router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_purchase_order(
    response: Response,
    purchase_order: PurchaseOrderCreate,
    db: SessionDep,
    user: CurrentUser = Depends(require_permission(Permission.MANAGE_PURCHASE_ORDERS))
    ):
    service = PurchaseOrderService(db)
    result = await service.create_purchase_order(user.tenant_id, purchase_order)
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
    response.status_code = status.HTTP_201_CREATED
    return result.data