from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
import uuid

# Import link models directly since they're needed at runtime
from .tenants_publishers import TenantPublisher
from .tenant_supplier import TenantSupplier

if TYPE_CHECKING:
    from .publishers import Publisher
    from .users import User
    from .suppliers import Supplier
    from .books import Book
    from .inventory import Inventory
    from .sales import Sales
    from .purchase_orders import PurchaseOrder
    from .tenant_settings import Settings
    from .receipt_templates import ReceiptTemplates
    from .monthly_sales_summary import MonthlySalesSummary
    from .tax_rates import TaxRates
    from .audit_logs import AuditLog


class Tenant(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(max_length=100, index=True, unique=True, nullable=False)
    contact_email: str = Field(max_length=100, index=True)
    contact_phone: Optional[str] = Field(default=None, max_length=15, index=True)
    address: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    publishers: List["Publisher"] = Relationship(back_populates="tenants", link_model=TenantPublisher,  sa_relationship_kwargs={"lazy": "selectin"})
    tenant_publishers: List["TenantPublisher"] = Relationship(back_populates="tenant")
    users: List["User"] = Relationship(back_populates="tenant", sa_relationship_kwargs={"lazy": "selectin"}, cascade_delete=True, passive_deletes=True)
    suppliers: List["Supplier"] = Relationship(back_populates="tenants",link_model=TenantSupplier, sa_relationship_kwargs={"viewonly": True})
    tenant_suppliers: List["TenantSupplier"] = Relationship(back_populates="tenant")    
    books: List["Book"] = Relationship(back_populates="tenant", sa_relationship_kwargs={"lazy": "selectin"}, cascade_delete=True, passive_deletes=True)
    inventory: List["Inventory"] = Relationship(back_populates="tenants", cascade_delete=True, passive_deletes=True)
    sales: List["Sales"] = Relationship(back_populates="tenant", cascade_delete=True, passive_deletes=True)
    purchase_orders: List["PurchaseOrder"] = Relationship(back_populates="tenant", cascade_delete=True, passive_deletes=True)
    settings: "Settings" = Relationship(back_populates="tenant", cascade_delete=True, passive_deletes=True)
    receipt_templates: List["ReceiptTemplates"] = Relationship(back_populates="tenant", cascade_delete=True, passive_deletes=True)
    monthly_sales_summaries: List["MonthlySalesSummary"] = Relationship(back_populates="tenant", cascade_delete=True, passive_deletes=True)
    tax_rates: List["TaxRates"] = Relationship(back_populates="tenant", cascade_delete=True, passive_deletes=True)
    audit_logs: List["AuditLog"] = Relationship(back_populates="tenant", cascade_delete=True, passive_deletes=True)

    def __repr__(self):
        return f"Tenant(id={self.id}, name={self.name}, contact_email={self.contact_email})"
