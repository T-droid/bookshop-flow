from pydantic import BaseModel, Field, validator
from typing import Optional, List
from decimal import Decimal
from datetime import date
import uuid

# Base models for creation
class BookCreateBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Book title")
    author: str = Field(..., min_length=1, max_length=255, description="Book author")
    description: Optional[str] = Field(None, description="Book description")
    language: str = Field(default="English", max_length=50, description="Book language")
    # category_id: Optional[uuid.UUID] = Field(None, description="Category ID")

class BookEditionCreateBase(BaseModel):
    isbn_number: str = Field(..., min_length=10, max_length=13, description="ISBN number (10 or 13 digits)")
    format: str = Field(default="Paperback", max_length=50, description="Book format")
    edition_number: int = Field(default=1, ge=1, description="Edition number")
    publisher: str = Field(..., min_length=1, max_length=255, description="Publisher name")
    publication_date: Optional[date] = Field(None, description="Publication date")
    page_count: Optional[int] = Field(None, ge=0, description="Number of pages")
    dimensions: Optional[str] = Field(None, max_length=100, description="Book dimensions")

    @validator('isbn_number')
    def validate_isbn(cls, v):
        # Remove any hyphens or spaces
        isbn = v.replace('-', '').replace(' ', '')
        if len(isbn) not in [10, 13]:
            raise ValueError('ISBN must be 10 or 13 digits')
        if not isbn.isdigit():
            raise ValueError('ISBN must contain only digits')
        return isbn

    @validator('format')
    def validate_format(cls, v):
        allowed_formats = ['Hardcover', 'Paperback', 'eBook', 'Audiobook']
        if v not in allowed_formats:
            raise ValueError(f'Format must be one of: {", ".join(allowed_formats)}')
        return v

# Simplified creation model with just quantity
class BookEditionCreate(BaseModel):
    """Model for creating a book edition with simple quantity"""
    book: BookCreateBase
    edition: BookEditionCreateBase
    quantity: int = Field(default=0, ge=0, description="Initial quantity to add to inventory")
    cost_price: Decimal = Field(default=0.00, ge=0, decimal_places=2, description="Cost price per unit")
    sale_price: Decimal = Field(default=0.00, ge=0, decimal_places=2, description="Sale price per unit")
    location: Optional[str] = Field(None, max_length=100, description="Storage location (optional)")

    class Config:
        schema_extra = {
            "example": {
                "book": {
                    "title": "The Great Gatsby",
                    "author": "F. Scott Fitzgerald",
                    "description": "A classic American novel",
                    "language": "English"
                },
                "edition": {
                    "isbn_number": "9780743273565",
                    "format": "Paperback",
                    "edition_number": 1,
                    "publisher": "Scribner",
                    "publication_date": "2004-09-30",
                    "page_count": 180,
                    "dimensions": "5.5 x 8.2 inches"
                },
                "quantity": 50,
                "cost_price": 8.99,
                "sale_price": 14.99,
                "location": "A1-B2"
            }
        }

# CSV Upload Model - matches the expected CSV structure
class CSVBookCreate(BaseModel):
    """Model for CSV book creation - matches CSV column structure"""
    title: str = Field(..., description="Book title")
    author: str = Field(..., description="Book author")
    isbn_number: str = Field(..., description="ISBN number", alias="isbn")
    publisher: str = Field(..., description="Publisher name")
    category: str = Field(..., description="Book category")
    format: str = Field(default="Paperback", description="Book format")
    quantity: int = Field(default=0, ge=0, description="Initial quantity")
    cost_price: Decimal = Field(default=0.00, ge=0, description="Cost price", alias="cost")
    # sale_price: Decimal = Field(default=0.00, ge=0, description="Sale price", alias="price")
    page_count: Optional[int] = Field(None, ge=0, description="Number of pages", alias="pages")
    publication_date: Optional[date] = Field(None, description="Publication date", alias="pub_date")
    language: str = Field(default="English", description="Book language")
    description: Optional[str] = Field(None, description="Book description")
    location: Optional[str] = Field(None, description="Storage location")
    
    @validator('isbn_number', pre=True)
    def validate_isbn(cls, v):
        if not v:
            raise ValueError('ISBN is required')
        # Remove any hyphens or spaces
        isbn = str(v).replace('-', '').replace(' ', '')
        if len(isbn) not in [10, 13]:
            raise ValueError('ISBN must be 10 or 13 digits')
        if not isbn.isdigit():
            raise ValueError('ISBN must contain only digits')
        return isbn

    @validator('format')
    def validate_format(cls, v):
        allowed_formats = ['Hardcover', 'Paperback', 'eBook', 'Audiobook']
        if v not in allowed_formats:
            return 'Paperback'  # Default fallback instead of error
        return v

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "title": "The Great Gatsby",
                "author": "F. Scott Fitzgerald",
                "isbn": "9780743273565",
                "publisher": "Scribner",
                "format": "Paperback",
                "quantity": 25,
                "cost": 8.99,
                "price": 14.99,
                "pages": 180,
                "pub_date": "2004-09-30",
                "language": "English",
                "description": "A classic American novel",
                "location": "A1-B2"
            }
        }

class BookEditionUpdate(BaseModel):
    """Model for updating a book edition"""
    book: Optional[BookCreateBase] = None
    edition: Optional[BookEditionCreateBase] = None
    quantity: Optional[int] = Field(None, ge=0, description="Update quantity")
    cost_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2, description="Update cost price")
    sale_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2, description="Update sale price")
    location: Optional[str] = Field(None, max_length=100, description="Update location")

# Bulk creation model for CSV uploads
class BulkBookCreate(BaseModel):
    """Model for bulk book creation (CSV upload)"""
    books: List[CSVBookCreate] = Field(..., min_items=1, description="List of books from CSV")

    class Config:
        schema_extra = {
            "example": {
                "books": [
                    {
                        "title": "Book Title 1",
                        "author": "Author 1",
                        "isbn": "9780743273565",
                        "publisher": "Publisher 1",
                        "format": "Paperback",
                        "quantity": 25,
                        "cost": 10.00,
                        "price": 15.99,
                        "pages": 200,
                        "language": "English"
                    },
                    {
                        "title": "Book Title 2",
                        "author": "Author 2",
                        "isbn": "9780141439518",
                        "publisher": "Publisher 2",
                        "format": "Hardcover",
                        "quantity": 15,
                        "cost": 12.50,
                        "price": 19.99,
                        "pages": 350,
                        "language": "English"
                    }
                ]
            }
        }

# Response models
class BookResponse(BaseModel):
    id: str
    title: str
    author: str
    description: Optional[str]
    language: str
    created_at: str
    updated_at: str

    @classmethod
    def from_db_model(cls, book):
        return cls(
            id=str(book.id),
            title=book.title,
            author=book.author,
            description=book.description,
            language=book.language,
            created_at=book.created_at.isoformat(),
            updated_at=book.updated_at.isoformat()
        )

class BookEditionResponse(BaseModel):
    edition_id: str
    book_id: str
    isbn_number: str
    format: str
    edition_number: int
    publisher: str
    publication_date: Optional[str]
    page_count: Optional[int]
    dimensions: Optional[str]
    created_at: str
    updated_at: str

    @classmethod
    def from_db_model(cls, edition):
        return cls(
            edition_id=str(edition.edition_id),
            book_id=str(edition.book_id),
            isbn_number=edition.isbn_number,
            format=edition.format,
            edition_number=edition.edition_number,
            publisher=edition.publisher,
            publication_date=edition.publication_date.isoformat() if edition.publication_date else None,
            page_count=edition.page_count,
            dimensions=edition.dimensions,
            created_at=edition.created_at.isoformat(),
            updated_at=edition.updated_at.isoformat()
        )

class InventoryResponse(BaseModel):
    inventory_id: str
    tenant_id: str
    edition_id: str
    quantity_on_hand: int
    quantity_reserved: int
    cost_price: str
    sale_price: str
    location: Optional[str]
    available_quantity: int
    created_at: str
    updated_at: str

    @classmethod
    def from_db_model(cls, inventory):
        return cls(
            inventory_id=str(inventory.inventory_id),
            tenant_id=str(inventory.tenant_id),
            edition_id=str(inventory.edition_id),
            quantity_on_hand=inventory.quantity_on_hand,
            quantity_reserved=inventory.quantity_reserved,
            cost_price=str(inventory.cost_price),
            sale_price=str(inventory.sale_price),
            location=inventory.location,
            available_quantity=inventory.available_quantity,
            created_at=inventory.created_at.isoformat(),
            updated_at=inventory.updated_at.isoformat()
        )

class BookEditionInventoryResponse(BaseModel):
    """Combined response for book, edition, and inventory"""
    book: BookResponse
    edition: BookEditionResponse
    inventory: InventoryResponse

# Error models
class ValidationError(BaseModel):
    field: str
    message: str
    row: Optional[int] = None  # For CSV row tracking

class BulkCreateResult(BaseModel):
    """Result model for bulk creation operations"""
    success_count: int
    error_count: int
    errors: List[ValidationError] = []
    created_books: List[BookEditionInventoryResponse] = []

    class Config:
        schema_extra = {
            "example": {
                "success_count": 8,
                "error_count": 2,
                "errors": [
                    {
                        "field": "isbn_number",
                        "message": "ISBN already exists",
                        "row": 3
                    },
                    {
                        "field": "title",
                        "message": "Title is required",
                        "row": 7
                    }
                ],
                "created_books": []
            }
        }

# Search and filter models
class BookSearchFilters(BaseModel):
    """Model for book search and filtering"""
    title: Optional[str] = Field(None, description="Search by title")
    author: Optional[str] = Field(None, description="Search by author")
    isbn_number: Optional[str] = Field(None, description="Search by ISBN")
    publisher: Optional[str] = Field(None, description="Search by publisher")
    format: Optional[str] = Field(None, description="Filter by format")
    language: Optional[str] = Field(None, description="Filter by language")
    in_stock_only: bool = Field(default=False, description="Show only books in stock")
    low_stock_only: bool = Field(default=False, description="Show only low stock books")
    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")

class BookSearchResponse(BaseModel):
    """Response model for book search"""
    books: List[BookEditionInventoryResponse]
    total_count: int
    page: int
    page_size: int
    total_pages: int

# Quick add model for simple book addition
class QuickBookAdd(BaseModel):
    """Simplified model for quick book addition"""
    title: str
    author: str
    isbn_number: str
    publisher: str
    quantity: int = Field(default=1, ge=0)
    sale_price: Decimal = Field(default=0.00, ge=0)
    format: str = Field(default="Paperback")
    
    class Config:
        schema_extra = {
            "example": {
                "title": "Quick Book",
                "author": "Quick Author",
                "isbn_number": "9780123456789",
                "publisher": "Quick Publisher",
                "quantity": 10,
                "sale_price": 19.99,
                "format": "Paperback"
            }
        }