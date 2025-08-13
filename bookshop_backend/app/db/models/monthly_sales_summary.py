from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import uuid
from typing import TYPE_CHECKING, Optional
from decimal import Decimal

if TYPE_CHECKING:
    from .tenants import Tenant
    from .book_editions import BookEdition

class MonthlySalesSummary(SQLModel, table=True):
    tenant_id: uuid.UUID = Field(primary_key=True, foreign_key="tenant.id", nullable=False)
    year: int = Field(primary_key=True, nullable=False, index=True)
    month: int = Field(primary_key=True, nullable=False, index=True)
    edition_id: Optional[uuid.UUID] = Field(default=None, primary_key=True, foreign_key="bookedition.edition_id")
    total_quantity: int = Field(default=0, nullable=False)
    total_revenue: Decimal = Field(max_digits=12, decimal_places=2, default=0.00, nullable=False)
    total_sales_count: int = Field(default=0, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationships
    tenant: "Tenant" = Relationship(back_populates="monthly_sales_summaries")
    edition: Optional["BookEdition"] = Relationship(back_populates="monthly_sales_summaries")