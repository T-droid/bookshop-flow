from fastapi import APIRouter, Body, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Annotated
from app.db.session import SessionDep
from ..tenants.tenants_model import TenantCreate
from ..user.user_model import UserCreate
from .onboarding_service import OnboardingService


router = APIRouter()

@router.post('/create-tenant-admin', status_code=status.HTTP_201_CREATED)
async def create_tenant_admin(
    db: SessionDep,
    tenant: TenantCreate,
    user: UserCreate
):
    """Create a new tenant with an admin user."""
    service = OnboardingService(db)
    
    onboarding_result = await service.create_tenant_with_admin(tenant, user)
    if not onboarding_result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=onboarding_result.error
        )
    
    # Convert SQLModel objects to dictionaries
    tenant_data = onboarding_result.data["tenant"]
    user_data = onboarding_result.data["user"]
    
    response_data = {
        "message": "Tenant and admin user created successfully",
        "tenant": {
            "id": str(tenant_data.id),
            "name": tenant_data.name,            
        },
        "user": {
            "email": user_data.email,
            "full_name": user_data.full_name,
            "phone_number": user_data.phone_number,
            "user_role": user_data.user_role,
        }
    }
    
    return response_data

@router.get('/tenants', status_code=status.HTTP_200_OK)
async def list_tenants(db: SessionDep):
    """List all tenants."""
    service = OnboardingService(db)
    
    result = await service.get_tenants()
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.error
        )
    
    return result.data

@router.get('/tenant/{tenant_id}', status_code=status.HTTP_200_OK)
async def get_tenant(
    tenant_id: str,
    db: SessionDep
):
    """Get a tenant by ID."""
    service = OnboardingService(db)
    
    result = await service.get_tenant_by_id(tenant_id)
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.error
        )
    
    return result.data

@router.delete('/tenant/{tenant_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant(
    tenant_id: str,
    db: SessionDep
):
    """Delete a tenant by ID."""
    service = OnboardingService(db)
    
    result = await service.tenants_service.delete_tenant(tenant_id)
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.error
        )

    return JSONResponse(content={
        "message": result.message
        }, status_code=status.HTTP_204_NO_CONTENT)
