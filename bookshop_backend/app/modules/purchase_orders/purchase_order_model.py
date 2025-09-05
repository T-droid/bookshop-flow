# In your purchase_order_model.py or similar
from pydantic import BaseModel, Field
from typing import List, Optional
from decimal import Decimal
import uuid
from datetime import datetime

class PurchaseOrderItemCreate(BaseModel):
    po_id: Optional[uuid.UUID] = Field(default=None, description="Purchase Order ID")
    edition_id: uuid.UUID = Field(..., description="Book edition ID")
    quantity_ordered: int = Field(..., gt=0, description="Quantity to order")
    unit_cost: Decimal = Field(..., gt=0, max_digits=10, decimal_places=2, description="Unit cost price")

class PurchaseOrderCreate(BaseModel):
    supplier_id: uuid.UUID = Field(..., description="Supplier ID")
    books: List[PurchaseOrderItemCreate] = Field(..., min_items=1, description="List of books to order")

    class Config:
        json_encoders = {
            Decimal: float
        }

class PurchaseOrderItemResponse(BaseModel):
    id: uuid.UUID
    edition_id: uuid.UUID
    quantity_ordered: int
    unit_cost: Decimal
    
class PurchaseOrderListResponse(BaseModel):
    id: uuid.UUID
    poNumber: Optional[str] = None
    supplier: str
    status: str
    totalAmount: float
    totalItems: int
    createdDate: str
    expectedDelivery: str

    class Config:
        from_attributes = True

class SupplierInfo(BaseModel):
    id: uuid.UUID
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class BooksInfo(BaseModel):
    id: uuid.UUID
    title: str
    isbn: str
    quantity: int
    unitPrice: float
    subtotal: float

class PurchaseOrderDetailsResponse(BaseModel):
    supplier: SupplierInfo
    books: List[BooksInfo]

# Internal model for repository
class PurchaseOrderData(BaseModel):
    tenant_id: uuid.UUID
    supplier_id: uuid.UUID
    total_amount: Decimal
    status: str = "pending"
    order_number: Optional[str] = None
    
    class Config:
        json_encoders = {
            Decimal: float
        }