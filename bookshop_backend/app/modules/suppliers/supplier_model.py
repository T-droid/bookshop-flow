import uuid
from pydantic import BaseModel, Field
from typing import Optional, List


class SupplierCreate(BaseModel):
    tenant_id: Optional[uuid.UUID] = Field(default=None)
    name: str = Field(..., max_length=255)
    contact_info: str = Field(..., max_length=500)
    category: str = Field(..., max_length=100)
    payment_terms: str = Field(..., max_length=255)
    status: str = Field("active", max_length=20)  # active, inactive, pending