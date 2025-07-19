from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from typing import Optional, List
import uuid

class SaleItems(SQLModel, table=True):
    id: uuid.UUID = Field(default=uuid.uuid4, primary_key=True)
    sale_id: uuid.UUID = Field(foreign_key="sales.id")
    book_id: uuid.UUID = Field(foreign_key="book.id")
    quantity: int = Field(gt=0)
    unit_price: float = Field(gt=0)

    # Relationships
    sale: "Sales" = Relationship(back_populates="sale_items")
    book: "Book" = Relationship(back_populates="sale_items")

    def __repr__(self):
        return f"SaleItems(id={self.id}, sale_id={self.sale_id}, book_id={self.book_id}, quantity={self.quantity})"