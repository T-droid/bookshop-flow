from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import uuid
from typing import TYPE_CHECKING

from .users import User

class OtpCode(SQLModel, table=True):
    id: uuid.UUID = Field(default=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, ondelete="CASCADE")
    otp: str = Field(max_length=10, nullable=False)
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    expires_at: datetime = Field(nullable=False)

    # Relationship
    user: "User" = Relationship(back_populates="otp_codes")

    def __repr__(self):
        return f"OtpCode(id={self.id}, user_id={self.user_id}, otp={self.otp})"