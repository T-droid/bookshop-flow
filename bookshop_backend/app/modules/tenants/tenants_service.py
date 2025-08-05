from ...db import models
from ...db.session import SessionDep
from .tenants_model import TenantCreate, TenantUpdate, TenantResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, Result
from typing import List, Optional
from fastapi import HTTPException, status, Depends, Query
from ...utils.redis_client import RedisClient
import uuid
from logging import getLogger
logger = getLogger(__name__)

async def create_tenant(
        tenant: TenantCreate,
        db: SessionDep
    ):
    name = tenant.name
    address = tenant.address,
    contact_email = tenant.contact_email,
    contact_phone = tenant.contact_phone
   
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

    new_tenant = models.Tenant(
        name=name,
        address=address,
        contact_email=contact_email,
        contact_phone=contact_phone
    )

    return {"message": f"tenant {new_tenant.name} created succesfully"}
    # db.add(new_tenant)    
    # await db.commit()
    
    # await db.refresh(new_tenant)
    
    # return "Tenant created successfully", TenantResponse.model_validate(new_tenant)
        
async def get_tenants(
    db: SessionDep
    ) -> List[TenantResponse]:
    result: Result[models.Tenant] = await db.execute(
        select(models.Tenant)
    )
    tenants: List[models.Tenant] = result.scalars().all()
    
    if not tenants:
        logger.info("No tenants found.")
        return []
    
    return [TenantResponse.model_validate(tenant) for tenant in tenants]    

async def get_tenant_by_id(
    tenant_id: uuid.uuid4, db: SessionDep
    ) -> TenantResponse:
    result: Result[models.Tenant] = await db.execute(
        select(models.Tenant).where(models.Tenant.id == tenant_id)
    )
    tenant: Optional[models.Tenant] = result.scalars().first()
    
    if not tenant:
        logger.error(f"Tenant with ID '{tenant_id}' not found.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tenant with ID '{tenant_id}' not found."
        )
    
    TenantResponse.model_validate(tenant)
    return {
        "id": tenant.id,
        "name": tenant.name,
        "contact_email": tenant.contact_email,
        "contact_phone": tenant.contact_phone,
        "address": tenant.address
    }


async def search_tenant(
    db: SessionDep,
    search_term: str = Query(..., min_length=1, max_length=100),    
) -> List[TenantResponse]:
    result: Result[models.Tenant] = await db.execute(
        select(models.Tenant).where(
            models.Tenant.name.ilike(f"%{search_term}%")
        )
    )
    tenants: List[models.Tenant] = result.scalars().all()
    
    if not tenants:
        logger.info(f"No tenants found matching '{search_term}'.")
        return []
    
    return [TenantResponse.model_validate(tenant) for tenant in tenants]


async def update_tenant(
    tenant_id: uuid.UUID,
    tenant_update: TenantUpdate,
    db: SessionDep
) -> TenantResponse:
    result: Result[models.Tenant] = await db.execute(
        select(models.Tenant).where(models.Tenant.id == tenant_id)
    )
    tenant: Optional[models.Tenant] = result.scalars().first()
    
    if not tenant:
        logger.error(f"Tenant with ID '{tenant_id}' not found.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tenant with ID '{tenant_id}' not found."
        )
    
    for key, value in tenant_update.model_dump(exclude_unset=True).items():
        setattr(tenant, key, value)
    
    await db.commit()
    await db.refresh(tenant)
    
    return TenantResponse.model_validate(tenant)
