from fastapi import APIRouter, Depends, HTTPException, status, Query
from .inventory_service import InventoryService
from ...db.session import SessionDep
from ...utils.auth import (
    require_permission,
    CurrentUser,
    Permission
)
from typing import Annotated


router = APIRouter()

@router.get('')
async def get_inventory(
    db: SessionDep,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
    user: CurrentUser = Depends(require_permission(Permission.READ_INVENTORY))    
):
    service = InventoryService(db)
    result = await service.get_tenant_inventory(user.tenant_id, limit)
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.error
        )
    return result.data