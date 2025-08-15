from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from .book_model import BookCreateBase, BookEditionCreateBase
from ...db import models
from typing import Union

class BookRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_book_category(self, book_category: str) -> uuid.UUID:
        stmt = select(models.Category).where(models.Category.name == book_category)
        result = await self.db.execute(stmt)
        existing_category = result.scalar_one_or_none()
        
        if existing_category:
            return existing_category.category_id
        else:
            new_category = models.Category(name=book_category)
            await self.save(new_category)
            return new_category.category_id

    async def create_book(self, book: BookCreateBase) -> uuid.UUID:
        # Check if book already exists
        stmt = select(models.Book).where(
            models.Book.title == book.title, 
            models.Book.author == book.author, 
            models.Book.category_id == book.category_id
        )
        result = await self.db.execute(stmt)
        existing_book = result.scalar_one_or_none()
        
        if existing_book:
            return existing_book.id
        else:
            new_book = models.Book(**book.dict())
            await self.save(new_book)
            return new_book.id

    async def create_book_edition(self, book_edition: BookEditionCreateBase) -> uuid.UUID:
        # Check if edition already exists
        stmt = select(models.BookEdition).where(models.BookEdition.isbn_number == book_edition.isbn_number)
        result = await self.db.execute(stmt)
        existing_edition = result.scalar_one_or_none()
        
        if existing_edition:
            return existing_edition.edition_id
        else:
            new_book_edition = models.BookEdition(**book_edition.dict())
            await self.save(new_book_edition)
            return new_book_edition.edition_id

    async def save(self, model: Union[models.Book, models.BookEdition, models.Category]) -> None:
        self.db.add(model)
        await self.db.commit()
        await self.db.refresh(model)


