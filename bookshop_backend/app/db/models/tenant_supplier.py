from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List, TYPE_CHECKING
import uuid

if TYPE_CHECKING:
    from .tenants import Tenant
    from .suppliers import Supplier

class TenantSupplier(SQLModel, table=True):
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", primary_key=True, ondelete="CASCADE")
    supplier_id: uuid.UUID = Field(foreign_key="supplier.id", primary_key=True, ondelete="CASCADE")

    # Relationships
    tenant: Optional["Tenant"] = Relationship(back_populates="tenant_suppliers")
    supplier: Optional["Supplier"] = Relationship(back_populates="supplier_tenants")

    def __repr__(self):
        return f"TenantSupplier(tenant_id={self.tenant_id}, supplier_id={self.supplier_id})"