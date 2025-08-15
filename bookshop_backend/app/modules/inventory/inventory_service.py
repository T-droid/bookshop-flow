from ...utils.result import ServiceResult
from ...db.session import SessionDep
from .inventory_repository import InventoryRepository
from .inventory_model import InventoryCreateBase

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