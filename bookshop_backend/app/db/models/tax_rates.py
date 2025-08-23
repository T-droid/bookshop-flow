from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import uuid

from .tenants import Tenant

class TaxRates(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", nullable=False, ondelete="CASCADE")
    name: str = Field(max_length=100, nullable=False)
    rate: float = Field(nullable=False)
    default: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationship
    tenant: "Tenant" = Relationship(back_populates="tax_rates")