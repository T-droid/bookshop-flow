from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from typing import Optional, List
import uuid

class Settings(SQLModel, table=True):
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", primary_key=True, ondelete="CASCADE")
    time_zone: str = Field(max_length=50, default='eat')
    currency: str = Field(max_length=10, default='ksh')
    email_notifications: bool = Field(default=True)
    sms_notification: bool = Field(default=False)

    # Relationships
    tenant: "Tenant" = Relationship(back_populates="settings")