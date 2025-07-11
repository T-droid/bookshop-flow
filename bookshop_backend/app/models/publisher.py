import uuid

from datetime import datetime
from sqlmodel import Field, SQLModel

class Publisher(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(nullable=False, index=True, unique=True)
    books: list["Book"] = Field(default=[], sa_relationship_kwargs={"back_populates": "publisher"})
    last_delivery_date: datetime | None = Field(default=None, nullable=True)