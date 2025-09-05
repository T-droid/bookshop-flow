from fastapi import APIRouter, Body, Response, status, HTTPException, Request, Depends, Query
from typing import Annotated, List, Optional
from ...db.session import SessionDep
from .purchase_order_service import PurchaseOrderService
from .purchase_order_model import PurchaseOrderCreate
from ...utils.auth import (
    require_permission,
    require_role,
    Permission,
    CurrentUser,
)


router = APIRouter()

@router.post("", status_code=status.HTTP_201_CREATED)
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

@router.get("")
async def get_purchase_orders(
    db: SessionDep,
    limit: Annotated[int, Query(gt=0, lt=101)] = 100,
    user: CurrentUser = Depends(require_permission(Permission.VIEW_PURCHASE_ORDERS))
):
    """Get all purchase orders for the tenant with optional filters"""
    service = PurchaseOrderService(db)
    result = await service.get_purchase_orders(tenant_id=user.tenant_id, limit=limit)
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
    return result.data


@router.get("/order-details/{po_id}")
async def get_purchase_order_details(
    po_id: str,
    db: SessionDep,
    user: CurrentUser = Depends(require_permission(Permission.VIEW_PURCHASE_ORDERS))
):
    """Get detailed information for a specific purchase order"""
    service = PurchaseOrderService(db)
    result = await service.get_purchase_order_details(po_id=po_id, tenant_id=user.tenant_id)
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
    return result.data