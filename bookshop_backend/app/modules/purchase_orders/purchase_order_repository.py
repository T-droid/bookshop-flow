from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import List, Optional, Union
import uuid
from decimal import Decimal
from ...db import models
from .purchase_order_model import PurchaseOrder, PurchaseOrderItemCreate

class PurchaseOrderRepository:
    """
    Repository for managing purchase order database operations.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, po_id: uuid.UUID) -> Optional[models.PurchaseOrder]:
        """Get purchase order by ID"""
        stmt = select(models.PurchaseOrder).where(models.PurchaseOrder.id == po_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

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

    async def create_purchase_order(self, po_data: PurchaseOrder) -> models.PurchaseOrder:
        """
        Create a new purchase order in the database.
        """
        db_po = models.PurchaseOrder(**po_data.dict())
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