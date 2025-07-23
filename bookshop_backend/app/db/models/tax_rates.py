from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import uuid


class TaxRates(SQLModel, table=True):
    id: uuid.UUID = Field(default=uuid.uuid4, primary_key=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", nullable=False)
    name: str = Field(max_length=100, nullable=False)
    rate: float = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationship
    tenant: "Tenant" = Relationship(back_populates="tax_rates")