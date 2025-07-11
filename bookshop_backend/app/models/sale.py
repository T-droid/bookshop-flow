from sqlmodel import Field, SQLModel
import uuid

from datetime import datetime

class Sale(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    invoice_number: str = Field(nullable=False, index=True, unique=True)
    subtotal: float = Field(nullable=False)
    tax: float = Field(nullable=False)
    total: float = Field(nullable=False)
    status: str = Field(default="pending", nullable=False, index=True, sa_enum=["pending", "completed", "cancelled"])