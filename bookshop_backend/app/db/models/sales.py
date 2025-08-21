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
    payment_method: str = Field(max_length=50, default="cash")  # cash, card, mpesa
    amount_received: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2, ge=0)
    change_given: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2, ge=0)
    total_amount: Decimal = Field(max_digits=10, decimal_places=2, ge=0, default=0.00)
    sale_status: str = Field(max_length=20, default="pending")  # paid, pending, cancelled
    customer_name: Optional[str] = Field(default=None, max_length=100)
    customer_phone: Optional[str] = Field(default=None, max_length=15)
    customer_email: Optional[str] = Field(default=None, max_length=100)
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationships
    tenant: "Tenant" = Relationship(back_populates="sales")
    sale_items: List["SaleItems"] = Relationship(back_populates="sale", cascade_delete=True)
    
    def __repr__(self):
        return f"Sales(id={self.id}, tenant_id={self.tenant_id}, sale_date={self.sale_date}, total_amount={self.total_amount})"