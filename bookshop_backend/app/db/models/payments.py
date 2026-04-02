from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, TYPE_CHECKING
import uuid
from datetime import datetime
from decimal import Decimal
import sqlalchemy as sa

if TYPE_CHECKING:
    from .tenants import Tenant
    from .sales import Sales


class Payments(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", nullable=False, index=True)
    sale_id: Optional[uuid.UUID] = Field(default=None, foreign_key="sales.id", nullable=True, index=True)

    provider: str = Field(max_length=50, default="manual")
    payment_method: str = Field(max_length=50, default="cash")
    amount: Decimal = Field(max_digits=10, decimal_places=2, ge=0)
    currency: str = Field(max_length=10, default="KES")

    invoice_number: Optional[str] = Field(default=None, max_length=100, unique=True, index=True)
    checkout_request_id: Optional[str] = Field(default=None, max_length=150, unique=True, index=True)
    provider_receipt: Optional[str] = Field(default=None, max_length=150, unique=True, index=True)

    status: str = Field(max_length=20, default="pending")  # pending, completed, failed, expired, cancelled
    failure_code: Optional[str] = Field(default=None, max_length=50)
    failure_reason: Optional[str] = Field(default=None, max_length=255)

    sale_data_snapshot: Optional[dict] = Field(default=None, sa_column=sa.Column(sa.JSON, nullable=True))
    raw_request_json: Optional[dict] = Field(default=None, sa_column=sa.Column(sa.JSON, nullable=True))
    raw_callback_json: Optional[dict] = Field(default=None, sa_column=sa.Column(sa.JSON, nullable=True))

    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)
    callback_received_at: Optional[datetime] = Field(default=None, index=True)
    completed_at: Optional[datetime] = Field(default=None, index=True)
    expires_at: Optional[datetime] = Field(default=None, index=True)

    tenant: "Tenant" = Relationship(back_populates="payments")
    sale: Optional["Sales"] = Relationship(back_populates="payments")

    def __repr__(self):
        return (
            f"Payments(id={self.id}, tenant_id={self.tenant_id}, "
            f"checkout_request_id={self.checkout_request_id}, status={self.status})"
        )
