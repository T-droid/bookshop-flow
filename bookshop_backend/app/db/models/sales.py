from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List, TYPE_CHECKING
import uuid
from datetime import datetime
from decimal import Decimal

if TYPE_CHECKING:
    from .tenants import Tenant
    from .sale_items import SaleItems

class Sales(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", nullable=False)
    sale_date: datetime = Field(default_factory=datetime.now, index=True)
    total_amount: Decimal = Field(max_digits=10, decimal_places=2, ge=0, default=0.00)
    sale_status: str = Field(max_length=20, default="pending")  # paid, pending, cancelled
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationships
    tenant: "Tenant" = Relationship(back_populates="sales")
    sale_items: List["SaleItems"] = Relationship(back_populates="sale", cascade_delete=True)
    
    def __repr__(self):
        return f"Sales(id={self.id}, tenant_id={self.tenant_id}, sale_date={self.sale_date}, total_amount={self.total_amount})"