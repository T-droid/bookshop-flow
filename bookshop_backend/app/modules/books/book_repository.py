from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
import uuid
from .book_model import BookCreateBase, BookEditionCreateBase
from ...db import models
from typing import Union, Dict

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
        
    async def get_book_with_inventory(self, isbn: str, tenant_id: uuid.UUID) -> Union[Dict, None]:
        stmt = select(
            models.Book.title,
            models.Book.author,
            models.BookEdition.isbn_number,
            models.BookEdition.edition_id,
            models.Inventory.cost_price,
            (models.Inventory.quantity_on_hand - models.Inventory.quantity_reserved).label('available_quantity'),
            (models.Inventory.cost_price * (1 + models.Inventory.profit) * (1 - models.Inventory.discount)).label('sale_price')
        ).select_from(
            models.BookEdition
        ).join(
            models.Book, models.BookEdition.book_id == models.Book.id
        ).join(
            models.Inventory, models.BookEdition.edition_id == models.Inventory.edition_id
        ).where(
            models.BookEdition.isbn_number == isbn,
            models.Inventory.tenant_id == tenant_id
        )
        result = await self.db.execute(stmt)
        book_data = result.first()
        if book_data:
            return {
                "edition_id": book_data.edition_id,
                "cost_price": book_data.cost_price,
                "title": book_data.title,
                "author": book_data.author,
                "isbn_number": book_data.isbn_number,
                "available_quantity": book_data.available_quantity,
                "sale_price": book_data.sale_price
            }
        return None

    async def count_books(self) -> int:
        stmt = select(func.count()).select_from(models.Book)
        result = await self.db.execute(stmt)
        return result.scalar()

    async def save(self, model: Union[models.Book, models.BookEdition, models.Category]) -> None:
        self.db.add(model)
        await self.db.commit()
        await self.db.refresh(model)


