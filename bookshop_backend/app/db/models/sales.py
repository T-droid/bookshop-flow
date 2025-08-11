from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List, TYPE_CHECKING
import uuid
from datetime import datetime

from .users import User
from .tenants import Tenant

if TYPE_CHECKING:
     from .sale_items import SaleItems

class Sales(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", ondelete="CASCADE")
    user_id: uuid.UUID = Field(foreign_key="user.id")
    sale_date: datetime = Field(default_factory=datetime.now)
    total_amount: float = Field(ge=0, default=0.0)
    payment_method: Optional[str] = Field(default=None)
    discount: Optional[str] = Field(default=None)

    # Relationships
    user: "User" = Relationship(back_populates="sales")
    tenant: "Tenant" = Relationship(back_populates="sales")
    sale_items: List["SaleItems"] = Relationship(back_populates="sale")
    
    def __repr__(self):
          return f"Sales(id={self.id}, tenant_id={self.tenant_id}, user_id={self.user_id}, sale_date={self.sale_date}, total_amount={self.total_amount})"