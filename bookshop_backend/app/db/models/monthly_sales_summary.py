from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import uuid


class MonthlySalesSummary(SQLModel, table=True):
    tenant_id: uuid.UUID = Field(primary_key=True, foreign_key="tenant.id", nullable=False, ondelete="CASCADE")
    book_id: uuid.UUID = Field(primary_key=True, foreign_key="book.id", nullable=False)
    year_month: datetime = Field(primary_key=True, nullable=False, index=True)
    total_quantity: int = Field(default=0, nullable=False)
    total_revenue: float = Field(default=0.0, nullable=False)
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationship
    tenant: "Tenant" = Relationship(back_populates="monthly_sales_summaries")
    book: "Book" = Relationship(back_populates="monthly_sales_summaries")