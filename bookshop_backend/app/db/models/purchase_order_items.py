from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, TYPE_CHECKING
import uuid
from decimal import Decimal

if TYPE_CHECKING:
    from .purchase_orders import PurchaseOrder
    from .book_editions import BookEdition

class PurchaseOrderItems(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    po_id: uuid.UUID = Field(foreign_key="purchaseorder.id", nullable=False)
    edition_id: uuid.UUID = Field(foreign_key="bookedition.edition_id", nullable=False)
    quantity_ordered: int = Field(gt=0, nullable=False)
    unit_cost: Decimal = Field(max_digits=10, decimal_places=2, gt=0, nullable=False)

    # Relationships
    purchase_order: Optional["PurchaseOrder"] = Relationship(back_populates="purchase_order_items")
    edition: Optional["BookEdition"] = Relationship(back_populates="purchase_order_items")