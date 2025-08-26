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
    
class PurchaseOrderResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    supplier_id: uuid.UUID
    order_date: datetime
    status: str
    total_amount: Optional[Decimal]
    
    class Config:
        orm_mode = True
        json_encoders = {
            Decimal: float,
            datetime: lambda v: v.isoformat()
        }

# Internal model for repository
class PurchaseOrderData(BaseModel):
    tenant_id: uuid.UUID
    supplier_id: uuid.UUID
    total_amount: Decimal
    status: str = "pending"
    
    class Config:
        json_encoders = {
            Decimal: float
        }