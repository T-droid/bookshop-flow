from sqlmodel import Field, SQLModel, Relationship
from typing import Optional
import uuid


class TenantPublisher(SQLModel, table=True):
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", primary_key=True)
    publisher_id: uuid.UUID = Field(foreign_key="publisher.id", primary_key=True)

    # Relationships
    tenant: Optional["Tenant"] = Relationship(back_populates="publishers")
    publisher: Optional["Publisher"] = Relationship(back_populates="tenants")

    def __repr__(self):
        return f"TenantPublisher(tenant_id={self.tenant_id}, publisher_id={self.publisher_id})"