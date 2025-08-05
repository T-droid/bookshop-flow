from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Annotated
import uuid
from .tenants_model import TenantResponse, TenantCreate
from ...db.session import SessionDep
from .tenants_service import create_tenant, get_tenants, get_tenant_by_id, search_tenant, update_tenant

router = APIRouter(tags=["Tenants"])

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=TenantResponse)
async def create_new_tenant(
    tenant: TenantCreate,
    db: SessionDep
):
    """
    Create a new tenant.
    """
    return await create_tenant(tenant, db)
    # message, tenant_response = await create_tenant(tenant, db)
    # if message:
    #     raise HTTPException(
    #         status_code=status.HTTP_201_CREATED,
    #         detail=message)
    # return tenant_response

@router.get("/all", response_model=List[TenantResponse])
async def list_tenants(
    db: SessionDep
):
    """
    Retrieve a list of all tenants.
    """
    tenants = await get_tenants(db)
    if not tenants:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tenants found.")
    
    return tenants

@router.get("/get_tenants_by_id/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: uuid.UUID,
    db: SessionDep
):
    """
    Retrieve a tenant by ID.
    """
    tenant = await get_tenant_by_id(tenant_id, db)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Tenant with ID '{tenant_id}' not found.")
    return tenant


@router.get("/search", response_model=List[TenantResponse])
async def search_tenants(
    search_term: str,
    db: SessionDep
):
    """
    Search for tenants by name.
    """
    if not search_term:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Search term cannot be empty.")
    
    tenants = await search_tenant(search_term, db)
    if not tenants:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No tenants found matching '{search_term}'."
        )
    
    return tenants

@router.put("/update_tenants/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: uuid.UUID,
    tenant: TenantCreate,
    db: SessionDep
):
    """
    Update an existing tenant.
    """
    updated_tenant = await update_tenant(tenant_id, tenant, db)
    if not updated_tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Tenant with ID '{tenant_id}' not found.")
    
    return updated_tenant