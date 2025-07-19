from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from typing import Optional, List
import uuid

class PurchaseOrder(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id")
    supplier_id: uuid.UUID = Field(foreign_key="supplier.id")
    order_date: datetime = Field(default_factory=datetime.now)
    total_amount: float = Field(gt=0)
    status: str = Field(max_length=50, default="Pending")

    # Relationships
    tenant: Optional["Tenant"] = Relationship(back_populates="purchase_orders")
    supplier: Optional["Supplier"] = Relationship(back_populates="purchase_orders")
    purchase_order_items: List["PurchaseOrderItems"] = Relationship(back_populates="purchase_order")

    def __repr__(self):
        return f"PurchaseOrder(id={self.id}, tenant_id={self.tenant_id}, supplier_id={self.supplier_id}, total_amount={self.total_amount})"