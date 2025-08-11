from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List, TYPE_CHECKING
import uuid
from datetime import datetime

# Import link models directly since they're needed at runtime
from .tenants_publishers import TenantPublisher

if TYPE_CHECKING:
    from .tenants import Tenant
    from .books import Book

class Publisher(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(max_length=100, index=True, unique=True, nullable=False)
    contact_info: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    tenants: List["Tenant"] = Relationship(back_populates="publishers", link_model=TenantPublisher, sa_relationship_kwargs={"lazy": "selectin"})
    books: List["Book"] = Relationship(back_populates="publisher")
    publisher_tenants: List["TenantPublisher"] = Relationship(back_populates="publisher")

    def __repr__(self):
        return f"Publisher(id={self.id}, name={self.name}, contact_info={self.contact_info})"
