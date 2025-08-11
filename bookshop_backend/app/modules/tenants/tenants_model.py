from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from uuid import UUID, uuid4

class TenantCreate(BaseModel):
    name: str = Field(..., max_length=100, description="Name of the tenant")
    contact_email: str = Field(..., max_length=100, description="Contact email for the tenant")
    contact_phone: Optional[str] = Field(None, max_length=15, description="Contact phone number for the tenant")
    address: Optional[str] = Field(None, max_length=255, description="Address of the tenant")

class TenantUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100, description="Name of the tenant")
    contact_email: Optional[str] = Field(None, max_length=100, description="Contact email for the tenant")
    contact_phone: Optional[str] = Field(None, max_length=15, description="Contact phone number for the tenant")
    address: Optional[str] = Field(None, max_length=255, description="Address of the tenant")

class TenantResponse(BaseModel):
    id: UUID = Field(default_factory=uuid4, description="Unique identifier for the tenant")
    name: str = Field(..., max_length=100, description="Name of the tenant")
    contact_email: str = Field(..., max_length=100, description="Contact email for the tenant")
    contact_phone: Optional[str] = Field(None, max_length=15, description="Contact phone number for the tenant")
    address: Optional[str] = Field(None, max_length=255, description="Address of the tenant")

    model_config = ConfigDict(from_attributes=True)
