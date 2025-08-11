from fastapi import APIRouter, Body, HTTPException, status
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
    print("**** Tenant and User Data:", tenant_data, user_data)
    
    # Create response data with proper serialization
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
    
    # Let FastAPI handle the JSON serialization
    return response_data
