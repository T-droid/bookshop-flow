import uuid

from sqlmodel import Field, SQLModel

class Book(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    isbn: str = Field(index=True, unique=True, nullable=False)
    title: str = Field(nullable=False)
    publisher_id: uuid.UUID = Field(foreign_key="publisher.id", nullable=False)
    grade: str = Field(nullable=False)
    price: float = Field(nullable=False)
    stock: int = Field(default=0, nullable=False)
    