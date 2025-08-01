from ...db import models
from ...db.session import SessionDep
from .tenants_model import TenantCreate, TenantUpdate, TenantResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, Result
from typing import List, Optional
from fastapi import HTTPException, status, Depends
from logging import getLogger
logger = getLogger(__name__)


async def create_tenant(tenant: TenantCreate, db: SessionDep):
    tenant_data = tenant.model_dump()
    name = tenant_data["name"]

    result: Result[models.Tenant] = await db.execute(
        select(models.Tenant).where(models.Tenant.name == name)
    )
    existing_tenant: Optional[models.Tenant] = result.scalars().first()

    if existing_tenant:
        logger.error(f"Tenant with name '{name}' already exists.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tenant with name '{name}' already exists."
        )

    new_tenant = models.Tenant(**tenant_data)
    db.add(new_tenant)    
    await db.commit()
    
    await db.refresh(new_tenant)
    
    return "Tenant created successfully", TenantResponse.model_validate(new_tenant)
        
