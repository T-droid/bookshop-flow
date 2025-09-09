from fastapi import APIRouter, HTTPException, status, Body, Response, Path, Query, Depends
from typing import List, Optional, Annotated
from ...db.session import SessionDep
from .sales_model import SalesRequestBody, SaleResponse
from .sales_service import SalesService
from ...utils.auth import (
    get_current_user,
    require_role,
    require_permission,
    CurrentUser,
    UserRole,
    Permission
)
import uuid


router = APIRouter()

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_sale(
    db: SessionDep,
    sale_data: SalesRequestBody,
    tenant_id: str = Path(..., description="The ID of the tenant"),
    user: CurrentUser = Depends(require_permission(Permission.WRITE_SALES))
):
    """
    Create a new sale.
    Requires: Write sales permission (Admin/Manager/Cashier)
    """
    if str(user.tenant_id) != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Cannot create sales for other tenants"
        )
    
    service = SalesService(db)
    result = await service.create_sale(sale_data, uuid.UUID(tenant_id))
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
    return {"sale_id": result.data["sale_id"], "message": "Sale created successfully"}

@router.get("", response_model=List[SaleResponse])
async def list_sales(
    db: SessionDep,
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    payment_method: Optional[str] = Query(None),
    sale_status: Optional[str] = Query(None),
    limit: int = Query(100, gt=0, le=1000),
    user: CurrentUser = Depends(require_permission(Permission.READ_SALES))
):
    """
    Retrieve a list of sales with optional filters.
    Requires: Read sales permission
    """    
    try:
        
        service = SalesService(db)
        result = await service.get_sales_by_tenant(
            tenant_id=user.tenant_id,
            date_from=date_from,
            date_to=date_to,
            payment=payment_method,
            status=sale_status,
            limit=limit
        )
        
        if not result.success:
            print(f"Service failed with error: {result.error}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error
            )
        return result.data
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Unexpected error occurred while listing sales: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/{sale_id}", response_model=SaleResponse)
async def get_sale(
    db: SessionDep,
    tenant_id: str = Path(..., description="The ID of the tenant"),
    sale_id: str = Path(..., description="The ID of the sale"),
    user: CurrentUser = Depends(require_permission(Permission.READ_SALES))
):
    """
    Retrieve a sale by its ID.
    Requires: Read sales permission
    """
    # Verify the tenant_id matches the user's tenant
    if str(user.tenant_id) != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Cannot view sales for other tenants"
        )
    
    try:
        service = SalesService(db)
        result = await service.get_sale_by_id(
            sale_id=uuid.UUID(sale_id),
            tenant_id=uuid.UUID(tenant_id)
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
            detail="Invalid sale ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/{sale_id}/receipt", status_code=status.HTTP_200_OK)
async def print_receipt(
    db: SessionDep,
    tenant_id: str = Path(..., description="The ID of the tenant"),
    sale_id: str = Path(..., description="The ID of the sale"),
    user: CurrentUser = Depends(require_permission(Permission.READ_SALES))
):
    """
    Print a receipt for a sale.
    Requires: Read sales permission
    """
    # Verify the tenant_id matches the user's tenant
    if str(user.tenant_id) != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Cannot print receipts for other tenants"
        )
    
    try:
        service = SalesService(db)
        result = await service.print_receipt(
            sale_id=uuid.UUID(sale_id),
            tenant_id=uuid.UUID(tenant_id)
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error
            )
        
        return {"message": "Receipt printed successfully"}
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid sale ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# Sales analytics endpoints - Admin/Manager only
@router.get("/analytics/summary", status_code=status.HTTP_200_OK)
async def get_sales_summary(
    db: SessionDep,
    tenant_id: str = Path(..., description="The ID of the tenant"),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    user: CurrentUser = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """
    Get sales summary analytics.
    Requires: Admin or Manager role
    """
    # Verify the tenant_id matches the user's tenant
    if str(user.tenant_id) != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Cannot view analytics for other tenants"
        )
    
    try:
        service = SalesService(db)
        result = await service.get_sales_summary(
            tenant_id=uuid.UUID(tenant_id),
            date_from=date_from,
            date_to=date_to
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
