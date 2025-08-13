from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, TYPE_CHECKING
import uuid
from datetime import datetime
from decimal import Decimal

if TYPE_CHECKING:
    from .tenants import Tenant
    from .book_editions import BookEdition

class Inventory(SQLModel, table=True):
    inventory_id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", nullable=False)
    edition_id: uuid.UUID = Field(foreign_key="bookedition.edition_id", nullable=False)
    quantity_on_hand: int = Field(ge=0, default=0)
    quantity_reserved: int = Field(ge=0, default=0)
    reorder_level: int = Field(ge=0, default=5)
    cost_price: Decimal = Field(ge=0, decimal_places=2, default=0.00)
    sale_price: Decimal = Field(ge=0, decimal_places=2, default=0.00)
    location: Optional[str] = Field(default=None, max_length=100)  # shelf, warehouse section
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationships
    tenant: Optional["Tenant"] = Relationship(back_populates="inventory")
    edition: Optional["BookEdition"] = Relationship(back_populates="inventory_records")

    # Unique constraint on tenant_id and edition_id combination
    __table_args__ = (
        {"sqlite_autoincrement": True},
    )

    @property
    def available_quantity(self) -> int:
        """Calculate available quantity (on_hand - reserved)"""
        return self.quantity_on_hand - self.quantity_reserved

    def __repr__(self):
        return f"Inventory(id={self.inventory_id}, tenant_id={self.tenant_id}, edition_id={self.edition_id}, on_hand={self.quantity_on_hand})" 
