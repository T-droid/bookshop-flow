from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List, TYPE_CHECKING
import uuid
from datetime import datetime

if TYPE_CHECKING:
    from .tenants import Tenant
    from .publishers import Publisher
    from .inventory import Inventory
    from .sale_items import SaleItems
    from .monthly_sales_summary import MonthlySalesSummary
    from .purchase_order_items import PurchaseOrderItems

class Book(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(index=True, unique=True)
    author: str = Field(max_length=100, index=True)
    isbn: str = Field(max_length=13, index=True, unique=True)
    price: float = Field(ge=0, default=0.0)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", unique=True, ondelete="CASCADE")
    publisher_id: uuid.UUID = Field(foreign_key="publisher.id", unique=True)
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationships
    tenant: Optional["Tenant"] = Relationship(back_populates="books")
    publisher: Optional["Publisher"] = Relationship(back_populates="books")
    inventory: Optional["Inventory"] = Relationship(back_populates="books")
    sale_items: List["SaleItems"] = Relationship(back_populates="book")
    monthly_sales_summaries: List["MonthlySalesSummary"] = Relationship(back_populates="book")
    purchase_order_items: List["PurchaseOrderItems"] = Relationship(back_populates="book")

    