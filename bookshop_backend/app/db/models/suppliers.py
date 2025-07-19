from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List
import uuid
from datetime import datetime

class Supplier(SQLModel, table=True):
    id: uuid.UUID = Field(default=uuid.uuid4, primary_key=True)
    name: str = Field(max_length=100, index=True, unique=True)
    contact_info: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationships
    tenants: List["Tenant"] = Relationship(back_populates="suppliers", link_model="TenantSupplier")
    purchase_orders: List["PurchaseOrder"] = Relationship(back_populates='supplier')