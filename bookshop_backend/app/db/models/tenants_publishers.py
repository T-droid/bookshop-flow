from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, TYPE_CHECKING
import uuid

if TYPE_CHECKING:
    from .tenants import Tenant
    from .publishers import Publisher


class TenantPublisher(SQLModel, table=True):
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", primary_key=True, ondelete="CASCADE")
    publisher_id: uuid.UUID = Field(foreign_key="publisher.id", primary_key=True, ondelete="CASCADE")
    
    # These reference the direct link table relationships
    tenant: Optional["Tenant"] = Relationship(back_populates="tenant_publishers")
    publisher: Optional["Publisher"] = Relationship(back_populates="publisher_tenants")
    
    def __repr__(self):
        return f"TenantPublisher(tenant_id={self.tenant_id}, publisher_id={self.publisher_id})"