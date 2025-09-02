from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import and_, select
from sqlalchemy import func, Row
import uuid
from .inventory_model import InventoryCreateBase
from ...db import models
from typing import Union, List, TypedDict, Dict, Any
from decimal import Decimal

class TopInventoryItem(TypedDict):
    title: str
    author: str
    isbn_number: str
    name: str  
    reorder_level: int
    cost_price: Decimal
    sale_price: Decimal
    stock: int

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
    
    async def get_total_inventory_value(self, tenant_id: uuid.UUID) -> float:
        try:
            stmt = select(models.Inventory).where(
                models.Inventory.tenant_id == tenant_id
            )
            result = await self.db.execute(stmt)
            rows = result.all()

            total_value = 0.0
            for row_tuple in rows:
                inventory_item = row_tuple[0] 
                quantity = float(inventory_item.quantity_on_hand)
                sale_price = getattr(inventory_item, 'sale_price', 0.0)
                
                total_value += quantity * float(sale_price)
            return total_value
        except Exception as e:
            print(f"Error calculating total inventory value: {str(e)}")
            return 0.0


    async def get_out_of_stock_inventory_items(self, tenant_id: uuid.UUID) -> int:
        try:
            stmt = select(models.Inventory).where(
                and_(
                    models.Inventory.tenant_id == tenant_id,
                    models.Inventory.available_quantity == 0
                )
            )
            result = await self.db.execute(stmt)
            result = result.all()
            return len(result)
        except Exception as e:
            print(f"Error getting out of stock items: {str(e)}")
            return 0
    
    async def get_low_stock_inventory_items(self, tenant_id: uuid.UUID) -> int:
        """Get count of items where available_quantity <= reorder_level"""
        try:
            # Fetch the data and calculate in Python instead of SQL
            stmt = select(
                models.Inventory
            ).where(
                models.Inventory.tenant_id == tenant_id
            )
            result = await self.db.execute(stmt)
            rows = result.all()
            
            # Count items where available_quantity <= reorder_level
            low_stock_count = 0
            for row_tuple in rows:
                inventory_item = row_tuple[0]  # Extract the Inventory instance
                if inventory_item.available_quantity <= inventory_item.reorder_level:
                    low_stock_count += 1
            return low_stock_count
            
        except Exception as e:
            print(f"Error getting low stock items: {str(e)}")
            return 0
    
    async def get_top_inventory_items_by_date(self, tenant_id: uuid.UUID, limit: int = 5) -> List[Dict[str, Any]]:
        try:
            stmt = (
                select(
                    models.Book.title,
                    models.Book.author,
                    models.BookEdition.isbn_number,
                    models.Category.name.label("category_name"),
                    models.Inventory.reorder_level,
                    models.Inventory.cost_price,
                    models.Inventory.quantity_on_hand,
                    models.Inventory.quantity_reserved,
                    models.Inventory.profit,
                    models.Inventory.discount
                )
                .select_from(models.Inventory)
                .join(models.BookEdition, models.Inventory.edition_id == models.BookEdition.edition_id)
                .join(models.Book, models.BookEdition.book_id == models.Book.id)
                .join(models.Category, models.Book.category_id == models.Category.category_id)
                .where(models.Inventory.tenant_id == tenant_id)
                .order_by(models.Inventory.created_at.desc())
                .limit(limit)
            )

            result = await self.db.execute(stmt)
            rows = result.all()

            data: List[Dict[str, Any]] = []
            for row in rows:
                # Calculate sale price from cost_price and profit
                cost_price = float(row.cost_price)
                profit_margin = float(row.profit)
                sale_price = cost_price * (1 + profit_margin)
                
                # Calculate available quantity
                available_quantity = row.quantity_on_hand - row.quantity_reserved
                
                items = {
                    "title": row.title,
                    "author": row.author,
                    "isbn_number": row.isbn_number,
                    "category_name": row.category_name,
                    "reorder_level": row.reorder_level,
                    "cost_price": cost_price,
                    "sale_price": sale_price,
                    "stock": available_quantity
                }
                data.append(items)
            return data
        except Exception as e:
            print(f"Error getting top inventory items: {str(e)}")
            import traceback
            traceback.print_exc()
            return []
    
    async def get_total_unique_inventory_items(self, tenant_id: uuid.UUID) -> int:
        try:
            stmt = select(func.count(models.Inventory.inventory_id)).where(
                models.Inventory.tenant_id == tenant_id
            )
            result = await self.db.execute(stmt)
            return result.scalar_one() or 0
        except Exception as e:
            print(f"Error getting total inventory items: {str(e)}")
            return 0

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
        return inventory