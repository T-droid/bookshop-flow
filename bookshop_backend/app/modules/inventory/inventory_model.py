from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
import uuid

class InventoryCreateBase(BaseModel):
    tenant_id: uuid.UUID = Field(..., description="Tenant ID")
    edition_id: uuid.UUID = Field(..., description="Edition ID")
    quantity_on_hand: int = Field(ge=0, default=0, description="Quantity on hand")
    quantity_reserved: Optional[int] = Field(ge=0, default=0, description="Quantity reserved")
    reorder_level: Optional[int]= Field(ge=0, default=5, description="Reorder level")
    cost_price: Decimal = Field(ge=0, decimal_places=2, default=0.00, description="Cost price of the edition")
    profit: Optional[Decimal] = Field(ge=0, decimal_places=4, default=0.00, description="Profit margin as decimal (e.g., 0.25 = 25%)")
    discount: Optional[Decimal] = Field(ge=0, le=1, decimal_places=4, default=0.00, description="Discount as decimal (e.g., 0.10 = 10%)")
    location: Optional[str] = Field(default=None, max_length=100, description="Location of the inventory (e.g., shelf, warehouse section)")

