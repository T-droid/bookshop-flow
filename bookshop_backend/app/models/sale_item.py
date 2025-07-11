from sqlmodel import Field, SQLModel
import uuid

from datetime import datetime


class SaleItem(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    sale_id: uuid.UUID = Field(foreign_key="sale.id", nullable=False)
    book_id: uuid.UUID = Field(foreign_key="book.id", nullable=False)
    quantity: int = Field(default=1, nullable=False)
    unit_price: float = Field(nullable=False)