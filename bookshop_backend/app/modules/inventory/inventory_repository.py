from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
import uuid
from .inventory_model import InventoryCreateBase
from ...db import models


class InventoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_inventory_by_edition_id_tenant_id(self, edition_id: uuid.UUID, tenant_id: uuid.UUID) -> models.Inventory | None:
        stmt = select(models.Inventory).where(
            models.Inventory.edition_id == edition_id,
            models.Inventory.tenant_id == tenant_id
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_inventory_by_id(self, inventory_id: uuid.UUID) -> models.Inventory | None:
        stmt = select(models.Inventory).where(models.Inventory.inventory_id == inventory_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def create_inventory(self, inventory_data: InventoryCreateBase) -> models.Inventory:
        new_inventory = models.Inventory(**inventory_data.dict())
        await self.save_inventory(new_inventory)
        return new_inventory

    async def update_inventory_item_quantity(self, inventory_item: models.Inventory, quantity: int) -> models.Inventory:
        """Update the quantity of an inventory item."""
        if quantity < 0 and abs(quantity) > inventory_item.quantity_on_hand:
            raise ValueError("Cannot reduce quantity below zero.")
        inventory_item.quantity_on_hand += quantity
        await self.save_inventory(inventory_item)
        return inventory_item

    async def delete_inventory_item(self, inventory_item: models.Inventory) -> None:
        """Delete an inventory item."""
        await self.db.delete(inventory_item)
        await self.db.commit()

    async def save_inventory(self, inventory: models.Inventory) -> models.Inventory:
        self.db.add(inventory)
        await self.db.commit()
        await self.db.refresh(inventory)