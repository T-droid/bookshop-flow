from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
import uuid
from enum import Enum


class SaleStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    CASH = "cash"
    MPESA = "mpesa"
    CARD = "card"
    BANK_TRANSFER = "bank_transfer"


# Sale Item Models
class SaleItemCreate(BaseModel):
    book_edition_id: uuid.UUID = Field(..., description="The ID of the book edition")
    quantity: int = Field(..., gt=0, description="Quantity of books sold")
    unit_price: Decimal = Field(..., ge=0, max_digits=10, decimal_places=2, description="Unit price of the book")
    discount_amount: Optional[Decimal] = Field(default=0.00, ge=0, max_digits=10, decimal_places=2, description="Discount amount per item")
    vat_rate: Optional[Decimal] = Field(default=16.00, ge=0, le=100, max_digits=5, decimal_places=2, description="VAT rate percentage")


class SaleItemUpdate(BaseModel):
    quantity: Optional[int] = Field(None, gt=0, description="Quantity of books sold")
    unit_price: Optional[Decimal] = Field(None, ge=0, max_digits=10, decimal_places=2, description="Unit price of the book")
    discount_amount: Optional[Decimal] = Field(None, ge=0, max_digits=10, decimal_places=2, description="Discount amount per item")
    vat_rate: Optional[Decimal] = Field(None, ge=0, le=100, max_digits=5, decimal_places=2, description="VAT rate percentage")


class SaleItemResponse(BaseModel):
    id: uuid.UUID
    sale_id: uuid.UUID
    book_edition_id: uuid.UUID
    quantity: int
    unit_price: Decimal
    discount_amount: Decimal
    vat_rate: Decimal
    line_total: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Payment Models
class PaymentCreate(BaseModel):
    payment_method: PaymentMethod = Field(..., description="Payment method used")
    amount: Decimal = Field(..., gt=0, max_digits=10, decimal_places=2, description="Payment amount")
    reference_number: Optional[str] = Field(None, max_length=100, description="Payment reference number")
    mpesa_phone: Optional[str] = Field(None, max_length=15, description="M-Pesa phone number")
    card_last_four: Optional[str] = Field(None, max_length=4, description="Last 4 digits of card")


class PaymentResponse(BaseModel):
    id: uuid.UUID
    sale_id: uuid.UUID
    payment_method: PaymentMethod
    amount: Decimal
    reference_number: Optional[str]
    mpesa_phone: Optional[str]
    card_last_four: Optional[str]
    payment_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Customer Models
class CustomerInfo(BaseModel):
    name: Optional[str] = Field(None, max_length=100, description="Customer name")
    phone: Optional[str] = Field(None, max_length=15, description="Customer phone number")
    email: Optional[str] = Field(None, max_length=100, description="Customer email address")


# Main Sale Models
class SaleCreate(BaseModel):
    sale_items: List[SaleItemCreate] = Field(..., min_items=1, description="List of items in the sale")
    payments: Optional[List[PaymentCreate]] = Field(default=[], description="List of payments for the sale")
    customer_info: Optional[CustomerInfo] = Field(None, description="Customer information")
    cashier_name: Optional[str] = Field(None, max_length=100, description="Name of the cashier")
    sale_notes: Optional[str] = Field(None, max_length=500, description="Additional notes for the sale")
    discount_amount: Optional[Decimal] = Field(default=0.00, ge=0, max_digits=10, decimal_places=2, description="Overall discount amount")
    
    @validator('sale_items')
    def validate_sale_items(cls, v):
        if not v:
            raise ValueError('At least one sale item is required')
        return v


class SaleUpdate(BaseModel):
    sale_status: Optional[SaleStatus] = Field(None, description="Sale status")
    sale_notes: Optional[str] = Field(None, max_length=500, description="Additional notes for the sale")
    discount_amount: Optional[Decimal] = Field(None, ge=0, max_digits=10, decimal_places=2, description="Overall discount amount")
    
    class Config:
        use_enum_values = True


class SaleResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    sale_date: datetime
    total_amount: Decimal
    sale_status: SaleStatus
    created_at: datetime
    updated_at: datetime
    
    # Related data
    sale_items: List[SaleItemResponse] = Field(default=[], description="Items in this sale")
    payments: List[PaymentResponse] = Field(default=[], description="Payments for this sale")
    
    # Additional computed fields
    subtotal: Optional[Decimal] = Field(None, description="Subtotal before tax and discounts")
    total_discount: Optional[Decimal] = Field(None, description="Total discount amount")
    total_vat: Optional[Decimal] = Field(None, description="Total VAT amount")
    amount_paid: Optional[Decimal] = Field(None, description="Total amount paid")
    balance_due: Optional[Decimal] = Field(None, description="Remaining balance due")
    
    # Sale metadata
    cashier_name: Optional[str] = Field(None, description="Name of the cashier")
    sale_notes: Optional[str] = Field(None, description="Additional notes for the sale")
    customer_info: Optional[CustomerInfo] = Field(None, description="Customer information")
    
    class Config:
        from_attributes = True
        use_enum_values = True


# List and Filter Models
class SaleListResponse(BaseModel):
    sales: List[SaleResponse]
    total_count: int
    page: int
    page_size: int
    total_pages: int


class SalesFilter(BaseModel):
    date_from: Optional[datetime] = Field(None, description="Filter sales from this date")
    date_to: Optional[datetime] = Field(None, description="Filter sales to this date")
    cashier: Optional[str] = Field(None, description="Filter by cashier name")
    payment_method: Optional[PaymentMethod] = Field(None, description="Filter by payment method")
    status: Optional[SaleStatus] = Field(None, description="Filter by sale status")
    customer_phone: Optional[str] = Field(None, description="Filter by customer phone")
    min_amount: Optional[Decimal] = Field(None, ge=0, description="Minimum sale amount")
    max_amount: Optional[Decimal] = Field(None, ge=0, description="Maximum sale amount")
    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=20, ge=1, le=100, description="Number of items per page")


# Receipt Models
class ReceiptData(BaseModel):
    sale: SaleResponse
    shop_info: dict = Field(..., description="Shop information for the receipt")
    receipt_number: str = Field(..., description="Receipt number")
    qr_code_data: Optional[str] = Field(None, description="QR code data for digital receipt")


# Analytics Models
class SalesSummary(BaseModel):
    total_sales: int
    total_revenue: Decimal
    average_sale_amount: Decimal
    top_selling_books: List[dict]
    sales_by_payment_method: dict
    daily_sales_trend: List[dict]


class DailySales(BaseModel):
    date: datetime
    total_sales: int
    total_revenue: Decimal
    cash_sales: Decimal
    mpesa_sales: Decimal
    card_sales: Decimal


# Inventory Impact Models
class InventoryUpdate(BaseModel):
    book_edition_id: uuid.UUID
    quantity_sold: int
    remaining_stock: int
    needs_reorder: bool = Field(default=False)


class SaleInventoryImpact(BaseModel):
    sale_id: uuid.UUID
    inventory_updates: List[InventoryUpdate]
    low_stock_alerts: List[dict] = Field(default=[])
