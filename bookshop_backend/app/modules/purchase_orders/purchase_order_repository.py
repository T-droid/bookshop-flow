from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
from typing import List, Optional, Union
import uuid
from decimal import Decimal
from ...db import models
from .purchase_order_model import PurchaseOrderData, PurchaseOrderItemCreate
from .purchase_order_utils import generate_order_number, calculate_expected_delivery_date

class PurchaseOrderRepository:
    """
    Repository for managing purchase order database operations.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, po_id: uuid.UUID, tenant_id: uuid.UUID) -> Optional[models.PurchaseOrder]:
        """Get purchase order by ID"""
        stmt = select(
            models.Book.title,
            models.PurchaseOrderItems.quantity_ordered,
            models.PurchaseOrderItems.unit_cost,
            models.BookEdition.isbn,
        ).select_from(
            models.PurchaseOrder
        ).join(
            models.PurchaseOrderItems, models.PurchaseOrder.id == models.PurchaseOrderItems.po_id
        ).join(
            models.BookEdition, models.PurchaseOrderItems.edition_id == models.BookEdition.edition_id
        ).join(
            models.Book, models.BookEdition.book_id == models.Book.id
        ).where(
            models.PurchaseOrder.id == po_id,
            models.PurchaseOrder.tenant_id == tenant_id
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_purchase_order_by_id(self, po_id: uuid.UUID, tenant_id: uuid.UUID) -> Optional[models.PurchaseOrder]:
        """Get purchase order by ID"""
        stmt = select(models.PurchaseOrder).where(
            models.PurchaseOrder.id == po_id,
            models.PurchaseOrder.tenant_id == tenant_id
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_purchase_order_supplier(self, po_number: str, tenant_id: uuid.UUID) -> Optional[models.PurchaseOrder]:
        """Get purchase order along with supplier details by ID"""
        stmt = select(
            models.Supplier.id,
            models.Supplier.name,
            models.Supplier.contact_info.label("email"),
            models.Supplier.phone_number.label("phone"),
            models.Supplier.address,
        ).select_from(
            models.PurchaseOrder
        ).join(
            models.Supplier, models.PurchaseOrder.supplier_id == models.Supplier.id
        ).where(
            models.PurchaseOrder.order_number == po_number,
            models.PurchaseOrder.tenant_id == tenant_id
        )

        result = await self.db.execute(stmt)
        result = result.first()

        if not result:
            return None

        return {
            "id": result.id,
            "name": result.name,
            "email": result.email,
            "phone": result.phone,
            "address": result.address
        }
    
    async def get_purchase_order_items(self, po_number: str) -> List[models.PurchaseOrderItems]:
        """Get all items for a specific purchase order"""
        stmt = select(
            models.Book.id,
            models.Book.title,
            models.BookEdition.isbn_number.label("isbn"),
            models.PurchaseOrderItems.quantity_ordered.label("quantity"),
            models.PurchaseOrderItems.unit_cost.label("unitPrice"),
            (models.PurchaseOrderItems.quantity_ordered * models.PurchaseOrderItems.unit_cost).label("subtotal")
        ).select_from(
            models.PurchaseOrder
        ).join(
            models.PurchaseOrderItems, models.PurchaseOrder.id == models.PurchaseOrderItems.po_id
        ).join(
            models.BookEdition, models.PurchaseOrderItems.edition_id == models.BookEdition.edition_id
        ).join(
            models.Book, models.BookEdition.book_id == models.Book.id
        ).where(
            models.PurchaseOrder.order_number == po_number
        )

        result = await self.db.execute(stmt)
        rows = result.all()
    
        # Convert to list of dictionaries
        return [
            {
                "id": row.id,
                "title": row.title,
                "isbn": row.isbn,
                "quantity": row.quantity,
                "unitPrice": float(row.unitPrice),
                "subtotal": float(row.subtotal)
            } for row in rows
        ]

    async def get_all(self, tenant_id: Optional[uuid.UUID] = None, supplier_id: Optional[uuid.UUID] = None, status: Optional[str] = None) -> List[models.PurchaseOrder]:
        """Get all purchase orders with optional filters"""
        stmt = select(models.PurchaseOrder)
        
        # Apply filters if provided
        if tenant_id:
            stmt = stmt.where(models.PurchaseOrder.tenant_id == tenant_id)
        if supplier_id:
            stmt = stmt.where(models.PurchaseOrder.supplier_id == supplier_id)
        if status:
            stmt = stmt.where(models.PurchaseOrder.status == status)
        
        result = await self.db.execute(stmt)
        return result.scalars().all()

    def format_date(self, date_obj):
        """Helper function to safely format dates"""
        if date_obj is None:
            return "N/A"
        return date_obj.strftime("%b %d, %Y")

    async def get_purchase_orders(self, tenant_id: uuid.UUID, limit: int):
        """Get all purchase orders for a tenant"""
        
        # Create a subquery to count purchase order items
        items_count_subquery = (
            select(func.count(models.PurchaseOrderItems.id))
            .where(models.PurchaseOrderItems.po_id == models.PurchaseOrder.id)
            .scalar_subquery()
        )
        
        stmt = select(
            models.PurchaseOrder.order_number,
            models.PurchaseOrder.id,
            models.PurchaseOrder.order_date,
            models.PurchaseOrder.status,
            models.PurchaseOrder.total_amount,
            items_count_subquery.label("total_items"),
            models.PurchaseOrder.expected_delivery_date,
            models.Supplier.name.label("supplier_name")
        ).join(
            models.Supplier, models.PurchaseOrder.supplier_id == models.Supplier.id
        ).where(
            models.PurchaseOrder.tenant_id == tenant_id
        ).order_by(
            models.PurchaseOrder.created_at.desc()
        ).limit(limit)

        results = await self.db.execute(stmt)
        results = results.all()

        return [
            {
                "id": result.id,
                "poNumber": result.order_number,
                "supplier": result.supplier_name,
                "status": result.status,
                "totalAmount": float(result.total_amount) if result.total_amount else 0.0,
                "totalItems": result.total_items,
                "createdDate": self.format_date(result.order_date),
                "expectedDelivery": self.format_date(result.expected_delivery_date)
            } for result in results
        ]

    async def get_next_order_number(self, tenant_id: uuid.UUID) -> str:
        """Generate the next order number for a tenant"""
        # Get the latest order number for this tenant
        stmt = select(models.PurchaseOrder.order_number).where(
            models.PurchaseOrder.tenant_id == tenant_id,
            models.PurchaseOrder.order_number.is_not(None)
        ).order_by(models.PurchaseOrder.order_number.desc()).limit(1)
        
        result = await self.db.execute(stmt)
        latest_order_number = result.scalar_one_or_none()
        
        return generate_order_number(latest_order_number)

    async def create_purchase_order(self, po_data: PurchaseOrderData) -> models.PurchaseOrder:
        """
        Create a new purchase order in the database.
        """
        # Generate order number if not provided
        if not po_data.order_number:
            po_data.order_number = await self.get_next_order_number(po_data.tenant_id)
        
        # Set expected delivery date if not provided
        data_dict = po_data.dict()
        if 'expected_delivery_date' not in data_dict or data_dict['expected_delivery_date'] is None:
            data_dict['expected_delivery_date'] = calculate_expected_delivery_date()
        
        db_po = models.PurchaseOrder(**data_dict)
        return await self.save(db_po)

    async def create_purchase_order_item(self, po_item_data: PurchaseOrderItemCreate) -> models.PurchaseOrderItems:
        """
        Create a new purchase order item in the database.
        """
        db_po_item = models.PurchaseOrderItems(**po_item_data.dict())
        return await self.save(db_po_item)

    async def update_purchase_order(self, po: models.PurchaseOrder, updates: dict) -> models.PurchaseOrder:
        """
        Update an existing purchase order in the database.
        """
        for key, value in updates.items():
            setattr(po, key, value)
        return await self.save(po)

    async def save(self, model: Union[models.PurchaseOrder, models.PurchaseOrderItems]) -> Union[models.PurchaseOrder, models.PurchaseOrderItems]:
        """Save or update a purchase order in the database."""
        self.db.add(model)
        await self.db.commit()
        await self.db.refresh(model)
        return model