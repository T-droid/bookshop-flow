from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from typing import Optional, List
import uuid

class PurchaseOrderItems(SQLModel, table=True):
    order_id: uuid.UUID = Field(foreign_key=True, primary_key=True, ondelete="CASCADE")
    book_id: uuid.UUID = Field(foreign_key=True, primary_key=True)
    quantity: int = Field(ge=0, default=0)
    unit_cost: float = Field(nullable=False)

    # Relationships
    purchase_order: List["PurchaseOrder"] = Relationship(back_populates="purchase_order_items")