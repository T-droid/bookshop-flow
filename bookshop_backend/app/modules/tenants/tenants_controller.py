from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from .tenants_model import TenantResponse, TenantCreate
from ...db.session import get_session
from .tenants_service import create_tenant

router = APIRouter(tags=["Tenants"])

@router.post("/tenants", status_code=status.HTTP_201_CREATED, response_model=TenantResponse)
async def create_new_tenant(
    tenant: TenantCreate,
    db: AsyncSession = Depends(get_session)
):
    """
    Create a new tenant.
    """
    message, tenant_response = await create_tenant(tenant, db)
    if message:
        raise HTTPException(status_code=status.HTTP_201_CREATED, detail=message)
    return tenant_response