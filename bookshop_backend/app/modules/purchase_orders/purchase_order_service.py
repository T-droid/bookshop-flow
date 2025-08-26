from ...db.session import SessionDep
from .purchase_order_repository import PurchaseOrderRepository
from .purchase_order_model import PurchaseOrderCreate, PurchaseOrder, PurchaseOrderItemCreate
from ...utils.result import ServiceResult


class PurchaseOrderService:
    def __init__(self, db: SessionDep):
        self.repository = PurchaseOrderRepository(db)

    async def create_purchase_order(self, tenant_id: str, po_data: PurchaseOrderCreate) -> ServiceResult:
        try:
            new_po = PurchaseOrder(
                tenant_id=tenant_id,
                supplier_id=po_data.supplier_id,
                total_amount=sum(item.unit_cost * item.quantity_ordered for item in po_data.books)
            )
            result = await self.repository.create_purchase_order(new_po)
            if not result:
                return ServiceResult.error("Failed to create purchase order")
            
            for item in po_data.books:
                new_po_item = PurchaseOrderItemCreate(
                    po_id=result.id,
                    edition_id=item.edition_id,
                    quantity_ordered=item.quantity_ordered,
                    unit_cost=item.unit_cost
                )
                item_result = await self.repository.create_purchase_order_item(new_po_item)
                if not item_result:
                    return ServiceResult.error("Failed to create purchase order item")
            return ServiceResult.success(new_po)
        except Exception as e:
            return ServiceResult.error(f"Failed to create purchase order: {e}")