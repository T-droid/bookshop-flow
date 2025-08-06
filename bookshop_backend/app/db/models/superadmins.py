from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List, TYPE_CHECKING
import uuid
from datetime import datetime
from .base_user import UserBase


class SuperAdmin(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True, unique=True, nullable=False)
    email: str = Field(index=True, unique=True, nullable=False)
    password: str = Field(nullable=False)
    last_login: Optional[datetime] = None
    is_active: bool = Field(default=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    @property
    def role(self) -> str:
        """Return the role for SuperAdmin"""
        return "superadmin"

    def __repr__(self):
        return f"SuperAdmin(id={self.id}, name={self.name}, email={self.email})"