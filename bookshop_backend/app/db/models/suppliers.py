from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List, TYPE_CHECKING
import uuid
from datetime import datetime

# Import link models directly since they're needed at runtime
from .tenant_supplier import TenantSupplier

if TYPE_CHECKING:
    from .tenants import Tenant
    from .purchase_orders import PurchaseOrder

class Supplier(SQLModel, table=True):
    id: uuid.UUID = Field(default=uuid.uuid4, primary_key=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", ondelete="CASCADE")
    name: str = Field(max_length=100, index=True, unique=True, nullable=False)
    contact_info: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationships
    tenants: List["Tenant"] = Relationship(back_populates="suppliers", link_model=TenantSupplier)
    purchase_orders: List["PurchaseOrder"] = Relationship(back_populates='supplier')