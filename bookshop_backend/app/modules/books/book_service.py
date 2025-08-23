from ...utils.result import ServiceResult
from ...db.session import SessionDep
from .book_repository import BookRepository
from .book_model import CSVBookCreate, BookCreateBase, BookEditionCreateBase
from ..inventory.inventory_service import InventoryService
from ..inventory.inventory_model import InventoryCreateBase
from typing import List
import uuid

class BookService:
    def __init__(self, db: SessionDep):
        self.db = db
        self.repository = BookRepository(db)
        self.inventory_service = InventoryService(db)

    async def add_bulk_books(self, books: List[CSVBookCreate], tenant_id: uuid.UUID) -> ServiceResult:
        try:
            for book in books:
                # create category if it doesn't exist
                category_name = book.category.lower().strip()
                category_id = await self.repository.create_book_category(category_name)

                # create book
                book_data = BookCreateBase(
                    title=book.title,
                    author=book.author,
                    description=book.description,
                    language=book.language,
                    category_id=category_id
                )
                book_id = await self.repository.create_book(book_data)

                # create book edition if it doesn't exist
                book_edition_data = BookEditionCreateBase(
                    book_id=book_id,
                    isbn_number=book.isbn_number,
                    format=book.format,
                    edition_number=book.edition_number,
                    publication_date=book.publication_date,
                    publisher=book.publisher,
                    page_count=book.page_count,
                    dimensions=getattr(book, 'dimensions', None)
                )
                edition_id = await self.repository.create_book_edition(book_edition_data)

                # create inventory item
                inventory_data = InventoryCreateBase(
                    edition_id=edition_id,
                    tenant_id=tenant_id,
                    quantity_on_hand=book.quantity
                )
                inventory_item = await self.inventory_service.create_inventory_item(inventory_data)
                if not inventory_item.success:
                    return ServiceResult(
                        success=False,
                        error=f"Failed to create inventory for book {book.title}: {inventory_item.error}"
                    )
            return ServiceResult(
                success=True,
                data={
                    "books": [book.title for book in books]
                },
                message="Bulk books added successfully"
                )
        except Exception as e:
            return ServiceResult(
                success=False,
                error=f"Failed to add bulk books: {str(e)}"
            )
    
    async def get_book_inventory_by_isbn(self, isbn: str, tenant_id: uuid.UUID) -> ServiceResult:
        try:
            book_data = await self.repository.get_book_with_inventory(isbn, tenant_id)
            
            if book_data:
                return ServiceResult(
                    success=True,
                    data={
                        "book_found": True,
                        **book_data
                    },
                    message="Book found successfully"
                )
            else:
                return ServiceResult(
                    success=True,
                    data={
                        "book_found": False,
                        "isbn": isbn
                    },
                    message="Book not found"
                )
        except Exception as e:
            raise Exception(f"Database error while searching for book: {str(e)}")