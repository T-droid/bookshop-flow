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
