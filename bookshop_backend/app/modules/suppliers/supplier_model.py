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



class Supplier(BaseModel):
    id: str = Field(..., description="Supplier ID")
    name: str = Field(..., max_length=255)
    contact_person: Optional[str] = Field(None, max_length=255)
    contact_info: str = None
    phone_number: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = Field(None, max_length=500)
    status: str = Field(..., max_length=20)


class SupplierDashboardResponse(BaseModel):
    total_suppliers: int = Field(..., description="Total number of suppliers")
    total_books: int = Field(..., description="Total number of books from all suppliers")
    total_active_suppliers: int = Field(..., description="Number of active suppliers")
    supplier_list: List[Supplier] = Field(default_factory=list, description="List of suppliers")
