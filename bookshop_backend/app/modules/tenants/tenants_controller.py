from fastapi import APIRouter, HTTPException, status, Form, Query
from typing import List, Optional, Annotated
import uuid
from .tenants_model import TenantResponse, TenantCreate, TenantUpdate
from ...db.session import SessionDep
from .tenants_service import TenantService
from . import api_router

router = APIRouter(tags=["Tenants"])
router.include_router(api_router, prefix="/{tenant_id}", responses={404: {"description": "Not found"}})


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=TenantResponse)
async def create_new_tenant(
    tenant: Annotated[TenantCreate, Form(...)],
    db: SessionDep,    
):
    """
    Create a new tenant.
    """
    service = TenantService(db)
    result = await service.create_tenant(tenant)
    
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
    
    return result.data

@router.get("/", response_model=List[TenantResponse])
async def list_tenants(
    db: SessionDep,
    name: Optional[str] = Query(None, min_length=1, description="Filter tenants by name"),
    email: Optional[str] = Query(None, min_length=1, description="Filter tenants by email"),
    created_at: Optional[str] = Query(None, description="Filter tenants by creation date")
):
    """
    Retrieve a list of all tenants, with an optional filter by name.
    """
    service = TenantService(db)
    
    result = await service.get_tenants(name=name, email=email, created_at=created_at)
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.error
        )
        
    return result.data

@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: uuid.UUID,
    db: SessionDep
):
    """
    Retrieve a tenant by ID.
    """
    service = TenantService(db)
    result = await service.get_tenant_by_id(tenant_id)
    
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.error
        )
    
    return result.data

@router.patch("/{tenant_id}", response_model=TenantResponse)
async def update_tenant_endpoint(
    tenant_id: uuid.UUID,
    tenant: Annotated[TenantUpdate, Form(...)],
    db: SessionDep
):
    """
    Update an existing tenant.
    """
    service = TenantService(db)
    result = await service.update_tenant(tenant_id, tenant)
    
    if not result.success:
        status_code = status.HTTP_404_NOT_FOUND if "not found" in result.error else status.HTTP_500_INTERNAL_SERVER_ERROR
        raise HTTPException(
            status_code=status_code,
            detail=result.error
        )
    
    return result.data

@router.delete("/{tenant_id}")
async def delete_tenant(
    tenant_id: uuid.UUID,
    db: SessionDep
):
    """
    Delete a tenant.
    """
    service = TenantService(db)
    result = await service.delete_tenant(tenant_id)
    
    if not result.success:
        status_code = status.HTTP_404_NOT_FOUND if "not found" in result.error else status.HTTP_500_INTERNAL_SERVER_ERROR
        raise HTTPException(
            status_code=status_code,
            detail=result.error
        )
    
    return {"message": result.message}