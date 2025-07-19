from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List
import uuid
from datetime import datetime

class Sales(SQLModel, table=True):
    id: uuid.UUID = Field(default=uuid.uuid4, primary_key=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id")
    user_id: uuid.UUID = Field(foreign_key="user.id")
    sale_date: datetime = Field(default_factory=datetime.now)
    total_amount: float = Field(gt=0)
    payment_method: Optional[str] = Field(default=None)
    discount: Optional[str] = Field(default=None)

    # Relationships
    user: "User" = Relationship(back_populates="sales")
    tenant: "Tenant" = Relationship(back_populates="sales")
    sale_items: List["SaleItems"] = Relationship(back_populates="sale")