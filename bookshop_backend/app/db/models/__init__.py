# Import all models to ensure they're registered with SQLModel
# Order matters for models with relationships

from .base_user import UserBase
from .superadmins import SuperAdmin
# Import link/junction tables first
from .tenant_supplier import TenantSupplier
from .tenants_publishers import TenantPublisher

# Import base models
from .tenants import Tenant
from .users import User
from .publishers import Publisher
from .suppliers import Supplier

# Import dependent models
from .tenant_settings import Settings
from .tax_rates import TaxRates
from .books import Book
from .inventory import Inventory
from .receipt_templates import ReceiptTemplates

# Import transaction-related models
from .sales import Sales
from .sale_items import SaleItems
from .purchase_orders import PurchaseOrder
from .purchase_order_items import PurchaseOrderItems
from .monthly_sales_summary import MonthlySalesSummary

# Import authentication-related models
from .webauthn_credentials import WebAuthnCredential
from .otp_codes import OtpCode
from .backup_codes import BackUpCodes

# Import audit models
from .audit_logs import AuditLog

__all__ = [
    "UserBase",
    "SuperAdmin",
    "TenantSupplier", 
    "TenantPublisher",
    "Tenant",
    "User",
    "Publisher",
    "Supplier",
    "Settings",
    "TaxRates",
    "Book",
    "Inventory",
    "ReceiptTemplates",
    "Sales",
    "SaleItems",
    "PurchaseOrder",
    "PurchaseOrderItems",
    "MonthlySalesSummary",
    "WebAuthnCredential",
    "OtpCode",
    "BackUpCodes",
    "AuditLog",
]
