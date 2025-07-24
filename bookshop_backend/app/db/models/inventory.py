from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
import uuid
from datetime import datetime


class Inventory(SQLModel, table=True):
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", primary_key=True, ondelete="CASCADE")
    book_id: uuid.UUID = Field(foreign_key="book.id", primary_key=True, ondelete="CASCADE")
    quantity: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=0)

    # Relationships
    tenants: Optional["Tenant"] = Relationship(back_populates="inventory")
    books: Optional["Book"] = Relationship(back_populates="inventory") 
