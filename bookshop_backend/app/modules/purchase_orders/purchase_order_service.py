from ...db.session import SessionDep
from .purchase_order_repository import PurchaseOrderRepository
from .purchase_order_model import PurchaseOrderCreate, PurchaseOrderData, PurchaseOrderItemCreate
from ...utils.result import ServiceResult


class PurchaseOrderService:
    def __init__(self, db: SessionDep):
        self.repository = PurchaseOrderRepository(db)

    async def create_purchase_order(self, tenant_id: str, po_data: PurchaseOrderCreate) -> ServiceResult:
        try:
            new_po = PurchaseOrderData(
                tenant_id=tenant_id,
                supplier_id=po_data.supplier_id,
                total_amount=sum(item.unit_cost * item.quantity_ordered for item in po_data.books),
                status="pending"
            )
            result = await self.repository.create_purchase_order(new_po)
            if not result:
                return ServiceResult(
                    error="Failed to create purchase order",
                    success=False
                )
                
            
            for item in po_data.books:
                new_po_item = PurchaseOrderItemCreate(
                    po_id=result.id,
                    edition_id=item.edition_id,
                    quantity_ordered=item.quantity_ordered,
                    unit_cost=item.unit_cost
                )
                item_result = await self.repository.create_purchase_order_item(new_po_item)
                if not item_result:
                    return ServiceResult(
                        error="Failed to create purchase order item",
                        success=False
                    )
            return ServiceResult(
                data=result.id,
                message="Purchase order created successfully",
                success=True
            )
        except Exception as e:
            return ServiceResult(
                error=f"Failed to create purchase order: {e}",
                success=False
            )