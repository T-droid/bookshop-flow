from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import uuid
from typing import Optional, List, TYPE_CHECKING

from .users import User

class BackUpCodes(SQLModel, table=True):
    id: uuid.UUID = Field(default=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, ondelete="CASCADE")
    code_hash: str = Field(max_length=64, nullable=False, unique=True)
    used_at: Optional[datetime] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationship
    user: "User" = Relationship(back_populates="backup_codes")