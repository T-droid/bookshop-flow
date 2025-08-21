from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, TYPE_CHECKING
import uuid
from decimal import Decimal

if TYPE_CHECKING:
    from .sales import Sales
    from .book_editions import BookEdition

class SaleItems(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    sale_id: uuid.UUID = Field(foreign_key="sales.id", nullable=False)
    edition_id: uuid.UUID = Field(foreign_key="bookedition.edition_id", nullable=False)
    isbn: str = Field(max_length=20, nullable=False)
    title: str = Field(max_length=255, nullable=False)
    author: Optional[str] = Field(default=None, max_length=255)
    quantity_sold: int = Field(gt=0, nullable=False)
    price_per_unit: Decimal = Field(max_digits=10, decimal_places=2, gt=0, nullable=False)
    total_price: Decimal = Field(max_digits=10, decimal_places=2, gt=0, nullable=False)
    tax_amount: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2, ge=0)
    discount_amount: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2, ge=0)

    # Relationships
    sale: "Sales" = Relationship(back_populates="sale_items")
    edition: "BookEdition" = Relationship(back_populates="sale_items")

    def __repr__(self):
        return f"SaleItems(id={self.id}, sale_id={self.sale_id}, edition_id={self.edition_id}, quantity_sold={self.quantity_sold})"