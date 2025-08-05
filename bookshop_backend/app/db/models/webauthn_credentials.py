from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import uuid
from typing import Optional, List

from .users import User

class WebAuthnCredential(SQLModel, table=True):
    id: uuid.UUID = Field(default=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, ondelete="CASCADE")
    credential_id: bytes = Field(nullable=False, unique=True)
    public_key: bytes = Field(nullable=False)
    sign_count: int = Field(default=0, nullable=False)
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    last_used_at: Optional[datetime] = Field(default=None, index=True)
    transports: Optional[str] = Field(default=None, max_length=100)

    # Relationship
    user: "User" = Relationship(back_populates="webauthn_credentials")