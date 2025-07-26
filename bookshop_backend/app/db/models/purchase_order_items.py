from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
import uuid

if TYPE_CHECKING:
    from .purchase_orders import PurchaseOrder
    from .books import Book

class PurchaseOrderItems(SQLModel, table=True):
    order_id: uuid.UUID = Field(foreign_key="purchaseorder.id", primary_key=True, ondelete="CASCADE")
    book_id: uuid.UUID = Field(foreign_key="book.id", primary_key=True)
    quantity: int = Field(ge=0, default=0)
    unit_cost: float = Field(nullable=False)

    # Relationships
    purchase_order: Optional["PurchaseOrder"] = Relationship(back_populates="purchase_order_items")
    book: Optional["Book"] = Relationship(back_populates="purchase_order_items")