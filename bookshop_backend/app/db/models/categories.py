from sqlmodel import Field, SQLModel, Relationship
from typing import List, TYPE_CHECKING
import uuid
from datetime import datetime

if TYPE_CHECKING:
    from .books import Book

class Category(SQLModel, table=True):
    category_id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(max_length=100, index=True, nullable=False)
    
    # Relationship to books
    books: List["Book"] = Relationship(back_populates="category")

    def __repr__(self):
        return f"Category(id={self.category_id}, name={self.name})"
