import uuid
from fastapi import APIRouter, Body, HTTPException, status, Response
from .book_model import CSVBookCreate
from ...db.session import SessionDep
from .book_service import BookService
from typing import List


router = APIRouter()

@router.post('', status_code=status.HTTP_201_CREATED)
async def create_book(
    book: List[CSVBookCreate],
    db: SessionDep
    ):
    """
    Create a new book entry.
    """
    service = BookService(db)
    result = await service.add_bulk_books(book)

    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
    
    return {"message": result.message, "data": result.data}

@router.get('/isbn/{isbn}', status_code=status.HTTP_200_OK)
async def get_book_by_isbn(isbn: str, db: SessionDep):
    """
    Get a book by its ISBN.
    """
    try:
        service = BookService(db)
        result = await service.get_book_inventory_by_isbn(
            isbn, 
            tenant_id=uuid.UUID("6e439a65-0e33-4181-8773-7a48df2bdfdf")
        )

        if not result.success:
            # This shouldn't happen with the new service implementation
            # but keeping as fallback
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
