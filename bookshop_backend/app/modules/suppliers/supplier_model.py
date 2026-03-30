import uuid
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List


class SupplierCreate(BaseModel):
    tenant_id: Optional[uuid.UUID] = Field(default=None)
    name: str = Field(..., min_length=1, max_length=255)
    contact_person: str = Field(..., min_length=1, max_length=255)
    contact_info: EmailStr = Field(..., max_length=500)
    phone_number: str = Field(..., min_length=1, max_length=20)
    address: Optional[str] = Field(default=None, max_length=500)
    category: str = Field(..., min_length=1, max_length=100)
    payment_terms: Optional[str] = Field(default=None, max_length=255)
    status: str = Field("active", max_length=20)

    @validator("name", "contact_person", "phone_number", "category", pre=True)
    def strip_required_strings(cls, value: str) -> str:
        if value is None:
            return value
        cleaned_value = value.strip()
        if not cleaned_value:
            raise ValueError("Field cannot be empty")
        return cleaned_value

    @validator("address", "payment_terms", pre=True)
    def strip_optional_strings(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        cleaned_value = value.strip()
        return cleaned_value or None

    @validator("status", pre=True)
    def normalize_status(cls, value: str) -> str:
        allowed_statuses = {"active", "inactive", "pending"}
        normalized_value = value.strip().lower()
        if normalized_value not in allowed_statuses:
            raise ValueError("Status must be one of: active, inactive, pending")
        return normalized_value



class Supplier(BaseModel):
    id: str = Field(..., description="Supplier ID")
    name: str = Field(..., max_length=255)
    contact_person: Optional[str] = Field(None, max_length=255)
    contact_info: Optional[str] = Field(default=None, max_length=500)
    phone_number: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = Field(None, max_length=500)
    status: str = Field(..., max_length=20)


class SupplierDashboardResponse(BaseModel):
    total_suppliers: int = Field(..., description="Total number of suppliers")
    total_books: int = Field(..., description="Total number of books from all suppliers")
    total_active_suppliers: int = Field(..., description="Number of active suppliers")
    supplier_list: List[Supplier] = Field(default_factory=list, description="List of suppliers")
