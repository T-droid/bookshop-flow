from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List, TYPE_CHECKING
import uuid
from datetime import datetime

if TYPE_CHECKING:
    from .categories import Category
    from .book_editions import BookEdition

class Book(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=255, index=True, nullable=False)
    author: str = Field(max_length=255, index=True, nullable=False)
    description: Optional[str] = Field(default=None)
    language: str = Field(max_length=50, default="English")
    category_id: Optional[uuid.UUID] = Field(default=None, foreign_key="category.category_id")
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationships
    category: Optional["Category"] = Relationship(back_populates="books")
    editions: List["BookEdition"] = Relationship(back_populates="book")

    def __repr__(self):
        return f"Book(id={self.id}, title={self.title}, author={self.author})"

    