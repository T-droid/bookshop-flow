from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List, TYPE_CHECKING
import uuid
from datetime import datetime

if TYPE_CHECKING:
    from .users import User


class Role(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True, unique=True, nullable=False)
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    def __repr__(self):
        return f"Role(id={self.id}, name={self.name}, description={self.description})"