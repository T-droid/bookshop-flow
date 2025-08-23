from fastapi import APIRouter, Body, HTTPException, status, Depends, Path
from .tax_model import CreateTaxModel, UpdateTaxModel
from .tax_service import TaxService
from ...db.session import SessionDep
from ...utils.auth import (
    get_current_user,
    require_role,
    get_current_tenant_id,
    require_permission,
    CurrentUser,
    UserRole,
    Permission
)
import uuid


router = APIRouter()

@router.post('', status_code=status.HTTP_201_CREATED)
async def create_tax_rate(
    tax_rate: CreateTaxModel,
    db: SessionDep,
    user: CurrentUser = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """
    Create a new tax rate.
    Requires: Admin or Manager role
    """
    service = TaxService(db)
    result = await service.create_tax_rate(tax_rate, get_current_tenant_id(user))
    
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
    
    return {"id": result.data, "message": "Tax rate created successfully"}

@router.get('', status_code=status.HTTP_200_OK)
async def get_tax_rates(
    db: SessionDep,
    user: CurrentUser = Depends(get_current_user)  # Any authenticated user can view tax rates
):
    """
    Get all tax rates for the current tenant.
    Available to all authenticated users.
    """
    try:
        service = TaxService(db)
        result = await service.get_tax_rates_by_tenant(user.tenant_id)
        
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

@router.get('/default', status_code=status.HTTP_200_OK)
async def get_default_tax_rate(
    db: SessionDep,
    user: CurrentUser = Depends(get_current_user)
):
    """
    Get the default tax rate for the current tenant.
    Available to all authenticated users.
    """
    try:
        service = TaxService(db)
        result = await service.get_default_tax_rate(user.tenant_id)
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.error
            )
        
        return result.data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get('/{tax_rate_id}', status_code=status.HTTP_200_OK)
async def get_tax_rate(
    tax_rate_id: str,
    db: SessionDep,
    user: CurrentUser = Depends(get_current_user)
):
    """
    Get a specific tax rate by ID.
    Available to all authenticated users.
    """
    try:
        service = TaxService(db)
        result = await service.get_tax_rate_by_id(
            tax_rate_id=uuid.UUID(tax_rate_id),
            tenant_id=user.tenant_id
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.error
            )
        
        return result.data
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tax rate ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.put('/{tax_rate_id}', status_code=status.HTTP_200_OK)
async def update_tax_rate(
    tax_rate_id: str,
    tax_rate: UpdateTaxModel,
    db: SessionDep,
    user: CurrentUser = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """
    Update a tax rate.
    Requires: Admin or Manager role
    """
    try:
        service = TaxService(db)
        result = await service.update_tax_rate(
            tax_rate_id=uuid.UUID(tax_rate_id),
            tax_rate_data=tax_rate,
            tenant_id=user.tenant_id
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error
            )
        
        return {"message": "Tax rate updated successfully", "data": result.data}
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tax rate ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.delete('/{tax_rate_id}', status_code=status.HTTP_200_OK)
async def delete_tax_rate(
    tax_rate_id: str,
    db: SessionDep,
    user: CurrentUser = Depends(require_role([UserRole.ADMIN]))
):
    """
    Delete a tax rate.
    Requires: Admin role only
    """
    try:
        service = TaxService(db)
        result = await service.delete_tax_rate(
            tax_rate_id=uuid.UUID(tax_rate_id),
            tenant_id=user.tenant_id
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error
            )
        
        return {"message": "Tax rate deleted successfully"}
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tax rate ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.post('/{tax_rate_id}/set-default', status_code=status.HTTP_200_OK)
async def set_default_tax_rate(
    tax_rate_id: str,
    db: SessionDep,
    user: CurrentUser = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """
    Set a tax rate as the default for the tenant.
    Requires: Admin or Manager role
    """
    try:
        service = TaxService(db)
        result = await service.set_default_tax_rate(
            tax_rate_id=uuid.UUID(tax_rate_id),
            tenant_id=user.tenant_id
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error
            )
        
        return {"message": "Default tax rate set successfully"}
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tax rate ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )