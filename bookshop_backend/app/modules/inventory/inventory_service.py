from ...utils.result import ServiceResult
from ...db.session import SessionDep
from .inventory_repository import InventoryRepository
from .inventory_model import InventoryCreateBase
import uuid

class InventoryService:
    def __init__(self, db: SessionDep):
        self.db = db
        self.repository = InventoryRepository(db)

    async def create_inventory_item(self, inventory_data: InventoryCreateBase) -> ServiceResult:
        try:
            inventory_item = await self.repository.get_inventory_by_edition_id_tenant_id(
                edition_id=inventory_data.edition_id,
                tenant_id=inventory_data.tenant_id
            )
            if inventory_item:
                # If the inventory item already exists, update its quantity
                inventory_item = await self.repository.update_inventory_item_quantity(
                    inventory_item=inventory_item,
                    quantity=inventory_data.quantity_on_hand
                )
                if not inventory_item:
                    return ServiceResult(
                        success=False,
                        error="Failed to update inventory item quantity"
                    )
                return ServiceResult(
                    success=True,
                    data=inventory_item,
                )

            new_inventory = await self.repository.create_inventory(inventory_data)
            return ServiceResult(
                success=True,
                data=new_inventory
            )
        except Exception as e:
            return ServiceResult(
                success=False,
                error=f"Failed to create inventory item: {str(e)}"
            )

    async def update_inventory_quantity(self, inventory_id: uuid.UUID, quantity: int) -> ServiceResult:
        try:
            inventory_item = await self.repository.get_inventory_by_id(inventory_id)
            if not inventory_item:
                return ServiceResult(
                    success=False,
                    error="Inventory item not found"
                )
            updated_inventory = await self.repository.update_inventory_item_quantity(
                inventory_item=inventory_item,
                quantity=quantity
            )
            return ServiceResult(
                success=True,
                data=updated_inventory
            )
        except Exception as e:
            return ServiceResult(
                success=False,
                error=f"Failed to update inventory quantity: {str(e)}"
            )
    
    async def get_tenant_inventory(self, tenant_id: uuid.UUID, limit: int) -> ServiceResult:
        try:
            total_value = await self.repository.get_total_inventory_value(tenant_id)

            out_of_stock = await self.repository.get_out_of_stock_inventory_items(tenant_id)

            low_stock = await self.repository.get_low_stock_inventory_items(tenant_id)

            total_items = await self.repository.get_total_unique_inventory_items(tenant_id)

            top_items = await self.repository.get_top_inventory_items_by_date(tenant_id, limit)

            data = {
                "total_value": total_value,
                "out_of_stock": out_of_stock,
                "low_stock": low_stock,
                "total_items": total_items,
                "top_items": top_items
            }

            print("******data:", data)

            return ServiceResult(
                data=data,
                success=True
            )

        except Exception as e:
            return ServiceResult(
                error=e,
                success=False
            )