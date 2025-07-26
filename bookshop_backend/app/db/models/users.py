from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List, TYPE_CHECKING
import uuid
from datetime import datetime

# Import link models directly since they're needed at runtime
from .user_roles import UserRoles

if TYPE_CHECKING:
    from .roles import Role
    from .tenants import Tenant
    from .sales import Sales
    from .webauthn_credentials import WebAuthnCredential
    from .otp_codes import OtpCode
    from .backup_codes import BackUpCodes
    from .audit_logs import AuditLog

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default=uuid.uuid4, primary_key=True)
    username: str = Field(max_length=50, index=True, nullable=False, unique=True)
    email: str = Field(max_length=100, index=True, nullable=False, unique=True)
    password_hash: str = Field(max_length=255)
    first_name: Optional[str] = Field(default=None, max_length=50)
    last_name: Optional[str] = Field(default=None, max_length=50)
    totp_secret: Optional[str] = Field(default=None, max_length=255)
    totp_enabled: bool = Field(default=False)
    last_login: Optional[datetime] = Field(default=None, index=True)
    tenant_id: Optional[uuid.UUID] = Field(default=None, foreign_key="tenant.id", ondelete='CASCADE')
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationships
    roles: Optional["Role"] = Relationship(back_populates="users", link_model=UserRoles)
    tenant: Optional['Tenant'] = Relationship(back_populates="users")
    sales: List["Sales"] = Relationship(back_populates="user")
    webauthn_credentials: List["WebAuthnCredential"] = Relationship(back_populates="user")
    otp_codes: List["OtpCode"] = Relationship(back_populates="user")
    backup_codes: List["BackUpCodes"] = Relationship(back_populates="user")
    audit_logs: List["AuditLog"] = Relationship(back_populates="user")

    def __repr__(self):
        return f"User(id={self.id}, username={self.username}, email={self.email})"