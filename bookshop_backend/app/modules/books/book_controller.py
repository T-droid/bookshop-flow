import uuid
from fastapi import APIRouter, Body, HTTPException, status, Response, Depends
from .book_model import CSVBookCreate
from ...db.session import SessionDep
from .book_service import BookService
from typing import List
from ...utils.auth import (
    get_current_user, 
    require_role, 
    require_permission,
    get_current_tenant_id,
    get_current_user_id,
    CurrentUser,
    UserRole,
    Permission
)

router = APIRouter()

@router.post('', status_code=status.HTTP_201_CREATED)
async def create_book(
    book: List[CSVBookCreate],
    db: SessionDep,
    user: CurrentUser = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """
    Create a new book entry.
    Requires: Admin or Manager role
    """
    service = BookService(db)
    result = await service.add_bulk_books(book, tenant_id=user.tenant_id)

    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
    
    return {"message": result.message, "data": result.data}

@router.get('/isbn/{isbn}', status_code=status.HTTP_200_OK)
async def get_book_by_isbn(
    isbn: str, 
    db: SessionDep,
    user: CurrentUser = Depends(require_permission(Permission.READ_BOOKS))
):
    """
    Get a book by its ISBN.
    Requires: Read books permission
    """
    try:
        service = BookService(db)
        result = await service.get_book_inventory_by_isbn(
            isbn, 
            tenant_id=user.tenant_id
        )

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error while processing request"
            )

        return {
            "success": True,
            "book": result.data,
            "message": result.message
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# Additional book endpoints with proper authorization
@router.get('', status_code=status.HTTP_200_OK)
async def get_all_books(
    db: SessionDep,
    skip: int = 0,
    limit: int = 100,
    user: CurrentUser = Depends(require_permission(Permission.READ_BOOKS))
):
    """
    Get all books for the current tenant.
    Requires: Read books permission
    """
    try:
        service = BookService(db)
        result = await service.get_books_by_tenant(
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

@router.put('/{book_id}', status_code=status.HTTP_200_OK)
async def update_book(
    book_id: str,
    book_data: dict,
    db: SessionDep,
    user: CurrentUser = Depends(require_permission(Permission.WRITE_BOOKS))
):
    """
    Update a book.
    Requires: Write books permission
    """
    try:
        service = BookService(db)
        result = await service.update_book(
            book_id=uuid.UUID(book_id),
            book_data=book_data,
            tenant_id=user.tenant_id
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error
            )
        
        return {"message": "Book updated successfully", "data": result.data}
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid book ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.delete('/{book_id}', status_code=status.HTTP_200_OK)
async def delete_book(
    book_id: str,
    db: SessionDep,
    user: CurrentUser = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """
    Delete a book.
    Requires: Admin or Manager role
    """
    try:
        service = BookService(db)
        result = await service.delete_book(
            book_id=uuid.UUID(book_id),
            tenant_id=user.tenant_id
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error
            )
        
        return {"message": "Book deleted successfully"}
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid book ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# Admin-only endpoints
@router.get('/admin/stats', status_code=status.HTTP_200_OK)
async def get_book_statistics(
    db: SessionDep,
    user: CurrentUser = Depends(require_role([UserRole.ADMIN]))
):
    """
    Get book statistics across all tenants.
    Requires: Admin role only
    """
    try:
        service = BookService(db)
        result = await service.get_book_statistics()
        
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

# Manager and Admin endpoints
@router.post('/bulk-import', status_code=status.HTTP_201_CREATED)
async def bulk_import_books(
    books: List[CSVBookCreate],
    db: SessionDep,
    user: CurrentUser = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """
    Bulk import books from CSV data.
    Requires: Admin or Manager role
    """
    try:
        service = BookService(db)
        result = await service.bulk_import_books(
            books=books,
            tenant_id=user.tenant_id,
            imported_by=user.user_id
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error
            )
        
        return {
            "message": f"Successfully imported {len(result.data.get('imported', []))} books",
            "data": result.data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# Search endpoint - available to all authenticated users
@router.get('/search', status_code=status.HTTP_200_OK)
async def search_books(
    q: str,
    db: SessionDep,
    limit: int = 50,
    user: CurrentUser = Depends(get_current_user)
):
    """
    Search books by title, author, or ISBN.
    Available to all authenticated users.
    """
    try:
        service = BookService(db)
        result = await service.search_books(
            query=q,
            tenant_id=user.tenant_id,
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
