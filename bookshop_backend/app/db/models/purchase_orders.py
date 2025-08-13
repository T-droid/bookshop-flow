from sqlmodel import Field, SQLModel, Relationship, Enum as SQLEnum
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
import uuid
from enum import Enum

if TYPE_CHECKING:
    from .tenants import Tenant
    from .suppliers import Supplier
    from .purchase_order_items import PurchaseOrderItems

class POStatus(str, Enum):
    PENDING = "Pending"
    RECEIVED = "Received"
    CANCELLED = "Cancelled"
    
class PurchaseOrder(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    order_date: datetime = Field(default_factory=datetime.now)
    total_amount: float = Field(gt=0)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", nullable=False)
    supplier_id: uuid.UUID = Field(foreign_key="supplier.id", nullable=False)
    status: str = Field(max_length=50, default="Pending")  # Pending, Received, Cancelled
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationships
    tenant: Optional["Tenant"] = Relationship(back_populates="purchase_orders")
    supplier: Optional["Supplier"] = Relationship(back_populates="purchase_orders")
    purchase_order_items: List["PurchaseOrderItems"] = Relationship(back_populates="purchase_order")

    def __repr__(self):
        return f"PurchaseOrder(id={self.id}, tenant_id={self.tenant_id}, supplier_id={self.supplier_id}, status={self.status})"