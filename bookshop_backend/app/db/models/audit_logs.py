from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import uuid
from typing import Optional, List, TYPE_CHECKING, Dict, Any
from sqlalchemy import JSON

if TYPE_CHECKING:
    from .tenants import Tenant
    from .users import User

class AuditLog(SQLModel, table=True):
    model_config = {"arbitrary_types_allowed": True}
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", nullable=False, ondelete="CASCADE")
    user_id: Optional[uuid.UUID] = Field(foreign_key="user.id", nullable=True, ondelete="SET NULL")
    table_name: str = Field(max_length=100, nullable=False)
    record_id: uuid.UUID = Field(nullable=False)
    action: str = Field(max_length=255, nullable=False)
    changed_data: Optional[Dict[str, Any]] = Field(default=None, sa_type=JSON)
    created_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationships
    tenant: "Tenant" = Relationship(back_populates="audit_logs")
    user: Optional["User"] = Relationship(back_populates="audit_logs")

    def __repr__(self):
        return f"AuditLog(id={self.id}, tenant_id={self.tenant_id}, user_id={self.user_id}, action={self.action})"