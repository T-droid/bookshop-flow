from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List, TYPE_CHECKING
import uuid
from datetime import datetime, date

if TYPE_CHECKING:
    from .books import Book
    from .inventory import Inventory
    from .sale_items import SaleItems
    from .monthly_sales_summary import MonthlySalesSummary
    from .purchase_order_items import PurchaseOrderItems

class BookEdition(SQLModel, table=True):
    edition_id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    book_id: uuid.UUID = Field(foreign_key="book.id", nullable=False)
    isbn_number: str = Field(max_length=13, index=True, unique=True, nullable=False)
    format: str = Field(max_length=50, default="Paperback")  # Hardcover, Paperback, eBook, Audiobook
    edition_number: int = Field(default=1)
    publisher: str = Field(max_length=255, nullable=False)
    publication_date: Optional[date] = Field(default=None)
    page_count: Optional[int] = Field(default=None, ge=0)
    dimensions: Optional[str] = Field(default=None, max_length=100)  # e.g., "6 x 9 inches"
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationships
    book: Optional["Book"] = Relationship(back_populates="editions")
    inventory_records: List["Inventory"] = Relationship(back_populates="edition")
    sale_items: List["SaleItems"] = Relationship(back_populates="edition")
    monthly_sales_summaries: List["MonthlySalesSummary"] = Relationship(back_populates="edition")
    purchase_order_items: List["PurchaseOrderItems"] = Relationship(back_populates="edition")

    def __repr__(self):
        return f"BookEdition(id={self.edition_id}, isbn_number={self.isbn_number}, format={self.format})"
