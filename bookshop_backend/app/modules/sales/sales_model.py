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
    customer_name: Optional[str] = Field(None, max_length=100)
    customer_email: Optional[str] = Field(None, max_length=100)
    customer_phone: Optional[str] = Field(None, max_length=15)
    total_amount: Decimal = Field(..., max_digits=10, decimal_places=2, gt=0)
    amount_received: Decimal = Field(..., max_digits=10, decimal_places=2, gt=0)
    change_given: Decimal = Field(..., max_digits=10, decimal_places=2, ge=0)
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

# Updated SaleResponse to match the required shape
class SaleResponse(BaseModel):
    sale_id: uuid.UUID
    date: datetime
    total_amount: Decimal
    sale_status: str
    customer_name: str
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    payment_method: str
    items: int  # Count of sale items

    class Config:
        from_attributes = True


class SalesDashboardSummaryResponse(BaseModel):
    today_sales_count: int
    today_revenue: Decimal
    monthly_revenue: Decimal
    recent_sales: List[SaleResponse]

    class Config:
        from_attributes = True


class MonthlySalesReportItem(BaseModel):
    month: str
    revenue: Decimal
    transactions: int


class BestSellerReportItem(BaseModel):
    title: str
    isbn: str
    units_sold: int
    revenue: Decimal


class SalesReportsSummaryResponse(BaseModel):
    total_revenue: Decimal
    total_transactions: int
    average_order_value: Decimal
    monthly_sales: List[MonthlySalesReportItem]
    best_sellers: List[BestSellerReportItem]

    class Config:
        from_attributes = True


# --- KCB Buni M-Pesa STK Push Models ---

class STKPushRequest(BaseModel):
    """Request body for initiating an M-Pesa STK Push."""
    phone_number: str = Field(..., description="Customer phone number (any Kenyan format)")
    amount: Decimal = Field(..., max_digits=10, decimal_places=2, gt=0)
    sale_data: SalesRequestBody = Field(..., description="Full sale data to persist on successful payment")


class STKPushResponse(BaseModel):
    """Response after initiating an STK Push."""
    checkout_request_id: str
    invoice_number: str
    status: str = Field(default="pending")
    message: str = Field(default="STK push sent successfully")


class MpesaCallbackData(BaseModel):
    """Model for the callback payload from KCB Buni API."""
    class Config:
        extra = "allow"  # Allow extra fields from KCB response


class STKPushStatusResponse(BaseModel):
    """Response for checking STK Push payment status."""
    checkout_request_id: str
    status: str  # pending, completed, failed, expired
    message: Optional[str] = None
    sale_id: Optional[uuid.UUID] = None
