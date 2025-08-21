from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
import uuid

class Customer(BaseModel):
    customer_name: str = Field(..., max_length=100)
    customer_email: Optional[str] = Field(None, max_length=100)
    customer_phone: Optional[str] = Field(None, max_length=15)

class Payment(BaseModel):
    payment_method: str = Field(..., max_length=50)
    amount_received: Decimal = Field(..., max_digits=10, decimal_places=2, gt=0)
    change_given: Decimal = Field(..., max_digits=10, decimal_places=2, ge=0)

class Sales(BaseModel):
    tenant_id: uuid.UUID = Field(..., alias="tenant_id")
    customer_name: str = Field(..., max_length=100)
    customer_email: Optional[str] = Field(None, max_length=100)
    customer_phone: Optional[str] = Field(None, max_length=15)
    total_amount: Decimal = Field(..., max_digits=10, decimal_places=2, gt=0)
    amount_received: Decimal = Field(..., max_digits=10, decimal_places=2, gt=0)
    change_given: Decimal = Field(..., max_digits=10, decimal_places=2, gt=0)
    tax: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2, ge=0)
    discount: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2, ge=0)
    sale_date: datetime = Field(default_factory=datetime.now)
    payment_method: str = Field(..., max_length=50)
    sale_status: str = Field(default="completed", max_length=20)

    class Config:
        from_attributes = True

class SaleItem(BaseModel):
    edition_id: uuid.UUID = Field(..., alias="edition_id")
    inventory_id: uuid.UUID = Field(..., alias="inventory_id")
    isbn: str = Field(..., max_length=20)
    title: str = Field(..., max_length=255)
    author: Optional[str] = Field(None, max_length=255)
    quantity_sold: int = Field(..., gt=0)
    price_per_unit: Decimal = Field(..., max_digits=10, decimal_places=2, gt=0)
    total_price: Decimal = Field(..., max_digits=10, decimal_places=2, gt=0)
    tax_amount: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2, ge=0)
    discount_amount: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2, ge=0)

class SalesRequestBody(BaseModel):
    customer: Optional[Customer] = None
    sale_items: List[SaleItem] = Field(..., min_items=1)
    payment: Payment = Field(..., alias="payment")
    total_amount: Decimal = Field(..., max_digits=10, decimal_places=2, gt=0)
    sale_status: str = Field(default="completed", max_length=20)
    sale_date: datetime = Field(default_factory=datetime.now)

class SaleResponse(BaseModel):
    sale_id: uuid.UUID
    tenant_id: uuid.UUID
    customer: Optional[Customer]
    sale_items: List[SaleItem]
    subtotal: Decimal
    total: Decimal
    tax: Optional[Decimal]
    discount: Optional[Decimal]
    sale_date: datetime
    payment_method: str
    status: str

    class Config:
        from_attributes = True

        