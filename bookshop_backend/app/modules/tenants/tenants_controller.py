from fastapi import APIRouter, HTTPException, status, Form, Query, Depends
from typing import List, Optional, Annotated
import uuid
from .tenants_model import TenantResponse, TenantCreate, TenantUpdate
from ...db.session import SessionDep
from .tenants_service import TenantService
from . import api_router
from ...utils.auth import (
    get_current_user,
    require_role,
    CurrentUser,
    UserRole
)

router = APIRouter(tags=["Tenants"])
router.include_router(api_router, prefix="/{tenant_id}", responses={404: {"description": "Not found"}})


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=TenantResponse)
async def create_new_tenant(
    tenant: Annotated[TenantCreate, Form(...)],
    db: SessionDep,
    user: CurrentUser = Depends(require_role([UserRole.SUPERADMIN]))
):
    """
    Create a new tenant.
    Requires: Superadmin role only
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
    created_at: Optional[str] = Query(None, description="Filter tenants by creation date"),
    user: CurrentUser = Depends(require_role([UserRole.SUPERADMIN]))  # Only superadmins can list all tenants
):
    """
    Retrieve a list of all tenants, with optional filters.
    Requires: Superadmin role only
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
    db: SessionDep,
    user: CurrentUser = Depends(get_current_user)
):
    """
    Retrieve a tenant by ID.
    Users can only access their own tenant, admins can access any tenant.
    """
    # Check if user is accessing their own tenant or is an admin
    if user.role != UserRole.ADMIN and user.tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Cannot view other tenants"
        )
    
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
    db: SessionDep,
    user: CurrentUser = Depends(require_role([UserRole.ADMIN, UserRole.SUPERADMIN]))
):
    """
    Update an existing tenant.
    Requires: Admin role only
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
    db: SessionDep,
    user: CurrentUser = Depends(require_role([UserRole.ADMIN, UserRole.SUPERADMIN]))
):
    """
    Delete a tenant.
    Requires: Admin role only
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

# Additional tenant management endpoints
@router.get("/{tenant_id}/stats", status_code=status.HTTP_200_OK)
async def get_tenant_statistics(
    tenant_id: uuid.UUID,
    db: SessionDep,
    user: CurrentUser = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """
    Get statistics for a specific tenant.
    Requires: Admin or Manager role, and access to the tenant
    """
    # Check if user is accessing their own tenant or is an admin
    if user.role != UserRole.ADMIN and user.tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Cannot view statistics for other tenants"
        )
    
    try:
        service = TenantService(db)
        result = await service.get_tenant_statistics(tenant_id)
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error
            )
        
        return result.data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )