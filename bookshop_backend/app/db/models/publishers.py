from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List
import uuid
from datetime import datetime

class Publisher(SQLModel, table=True):
    id: uuid.UUID = Field(default=uuid.uuid4, primary_key=True)
    bookshop_id: uuid.UUID = Field(foreign_key="bookshop.id", unique=True)
    name: str = Field(max_length=100, index=True, unique=True)
    contact_info: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationships
    tenants: List["Tenant"] = Relationship(back_populates="publishers", link_model="TenantPublisher")
    books: List["Book"] = Relationship(back_populates="publisher")

    def __repr__(self):
        return f"Publisher(id={self.id}, name={self.name}, contact_info={self.contact_info})"