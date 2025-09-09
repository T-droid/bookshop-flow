from fastapi import APIRouter, Body, Response, status, HTTPException, Request, Depends, Path, Query
from .supplier_model import SupplierCreate
from .supplier_service import SupplierService
from ...db.session import SessionDep
from ...utils.auth import (
    get_current_user,
    get_current_tenant_id,
    require_role,
    require_permission,
    CurrentUser,
    UserRole,
    Permission
)
import uuid

from typing import Annotated


router = APIRouter()

@router.post('/', status_code=status.HTTP_201_CREATED)
async def create_supplier(
    response: Response,
    db: SessionDep,
    supplier: SupplierCreate = Body(...),
    user: CurrentUser = Depends(require_permission(Permission.WRITE_SUPPLIERS))
):
    """
    Create a new supplier.
    Requires: Write suppliers permission (Admin/Manager)
    """
    service = SupplierService(db)
    supplier.tenant_id = get_current_tenant_id(user)
    result = await service.create_supplier(supplier)
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
    response.headers["Location"] = f"/suppliers/{result.data}"
    return {"supplier_id": result.data, "message": "Supplier created successfully"}

@router.get("/", status_code=status.HTTP_200_OK)
async def get_suppliers(
    db: SessionDep,
    skip: Annotated[int, Query(...)] = 0,
    limit: Annotated[int, Query(...)] = 100,
    user: CurrentUser = Depends(require_permission(Permission.READ_SUPPLIERS))
):
    """
    Get all suppliers for the current tenant.
    Requires: Read suppliers permission
    """
    try:
        service = SupplierService(db)
        result = await service.get_suppliers_by_tenant(
            tenant_id=user.tenant_id,
            skip=skip,
            limit=limit
        )
        
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

@router.get("/dashboard", status_code=status.HTTP_200_OK)
async def get_supplier_dashboard(
    db: SessionDep,
    user: CurrentUser = Depends(require_permission(Permission.READ_SUPPLIERS))
):
    """
    Get supplier dashboard statistics.
    Requires: Read suppliers permission
    """
    try:
        service = SupplierService(db)
        result = await service.get_supplier_dashboard(
            tenant_id=user.tenant_id
        )

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

@router.get("/{supplier_id}", status_code=status.HTTP_200_OK)
async def get_supplier(
    supplier_id: str,
    db: SessionDep,
    user: CurrentUser = Depends(require_permission(Permission.READ_SUPPLIERS))
):
    """
    Get a specific supplier by ID.
    Requires: Read suppliers permission
    """
    try:
        service = SupplierService(db)
        result = await service.get_supplier_by_id(
            supplier_id=uuid.UUID(supplier_id),
            tenant_id=get_current_tenant_id(user)
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
            detail="Invalid supplier ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.put("/{supplier_id}", status_code=status.HTTP_200_OK)
async def update_supplier(
    supplier_id: str,
    supplier_data: dict,  # You can create a proper update model
    db: SessionDep,
    user: CurrentUser = Depends(require_permission(Permission.WRITE_SUPPLIERS))
):
    """
    Update a supplier.
    Requires: Write suppliers permission (Admin/Manager)
    """
    try:
        service = SupplierService(db)
        result = await service.update_supplier(
            supplier_id=uuid.UUID(supplier_id),
            supplier_data=supplier_data,
            tenant_id=get_current_tenant_id(user)
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error
            )
        
        return {"message": "Supplier updated successfully", "data": result.data}
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid supplier ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.delete("/{supplier_id}", status_code=status.HTTP_200_OK)
async def delete_supplier(
    supplier_id: str,
    db: SessionDep,
    user: CurrentUser = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """
    Delete a supplier.
    Requires: Admin or Manager role
    """
    try:
        service = SupplierService(db)
        result = await service.delete_supplier(
            supplier_id=uuid.UUID(supplier_id),
            tenant_id=get_current_tenant_id(user)
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error
            )
        
        return {"message": "Supplier deleted successfully"}
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid supplier ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )