from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List
import uuid

class TenantSupplier(SQLModel, table=True):
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", primary_key=True)
    supplier_id: uuid.UUID = Field(foreign_key="supplier.id", primary_key=True)

    # Relationships
    tenant: Optional["Tenant"] = Relationship(back_populates="suppliers")
    supplier: Optional["Supplier"] = Relationship(back_populates="tenants")

    def __repr__(self):
        return f"TenantSupplier(tenant_id={self.tenant_id}, supplier_id={self.supplier_id})"