from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List, TYPE_CHECKING
import uuid
from datetime import datetime
from .base_user import UserBase

if TYPE_CHECKING:
    from .tenants import Tenant
    from .sales import Sales
    from .webauthn_credentials import WebAuthnCredential
    from .otp_codes import OtpCode
    from .backup_codes import BackUpCodes
    from .audit_logs import AuditLog

class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(max_length=100, index=True, nullable=False, unique=True)
    phone_number: str = Field(default=None, max_length=15, nullable=False)
    password: str = Field(max_length=255)
    full_name: Optional[str] = Field(default=None, max_length=50)
    totp_secret: Optional[str] = Field(default=None, max_length=255)
    totp_enabled: bool = Field(default=False)
    last_login: Optional[datetime] = Field(default=None, index=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", ondelete='CASCADE', nullable=False)
    user_role: str = Field(default="manager", nullable=False)  # 'admin' or 'manager'
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationships
    tenant: Optional['Tenant'] = Relationship(back_populates="users")
    sales: List["Sales"] = Relationship(back_populates="user", cascade_delete=True, passive_deletes=True)
    webauthn_credentials: List["WebAuthnCredential"] = Relationship(back_populates="user", cascade_delete=True, passive_deletes=True)
    otp_codes: List["OtpCode"] = Relationship(back_populates="user", cascade_delete=True, passive_deletes=True)
    backup_codes: List["BackUpCodes"] = Relationship(back_populates="user", cascade_delete=True, passive_deletes=True)
    audit_logs: List["AuditLog"] = Relationship(back_populates="user", cascade_delete=True, passive_deletes=True)

    @property
    def role(self) -> str:
        """Return the user's role"""
        return self.user_role

    def __repr__(self):
        return f"User(id={self.id}, username={self.username}, email={self.email})"