from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from typing import Optional, List
import uuid

class ReceiptTemplates(SQLModel, table=True):
    id: uuid.UUID = Field(default=uuid.uuid4, primary_key=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", nullable=False)
    name: str = Field(max_length=100, nullable=False)
    template: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationship
    tenant: "Tenant" = Relationship(back_populates="receipt_templates")