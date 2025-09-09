from ...db.session import SessionDep
from .purchase_order_repository import PurchaseOrderRepository
from .purchase_order_model import PurchaseOrderCreate, PurchaseOrderData, PurchaseOrderItemCreate, PurchaseOrderListResponse, PurchaseOrderDetailsResponse
from ...utils.result import ServiceResult
from typing import List, Optional
import uuid


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

    async def get_purchase_orders(
        self, 
        tenant_id: uuid.UUID,
        limit: int = 100
    ) -> ServiceResult:
        """Get all purchase orders for a tenant with optional filters"""
        try:            
            purchase_orders = await self.repository.get_purchase_orders(tenant_id, limit=limit)
            # Convert to response models
            response_data = [
                PurchaseOrderListResponse.model_validate(po) for po in purchase_orders
            ]
            
            return ServiceResult(
                data=response_data,
                message="Purchase orders retrieved successfully",
                success=True
            )
        except Exception as e:
            return ServiceResult(
                error=f"Failed to get purchase orders: {e}",
                success=False
            )

    async def get_purchase_order_details(self, po_id: str, tenant_id: str) -> ServiceResult:
        """Get detailed information for a specific purchase order"""
        try:
            supplier_details = await self.repository.get_purchase_order_supplier(po_id, tenant_id)
            if not supplier_details:
                return ServiceResult(
                    error="Purchase order not found",
                    success=False
                )

            items = await self.repository.get_purchase_order_items(po_id)
            if items is None:
                return ServiceResult(
                    error="Failed to retrieve purchase order items",
                    success=False
                )
            purchase_order_details = PurchaseOrderDetailsResponse.model_validate({
                "supplier": supplier_details,
                "books": items
            })

            return ServiceResult(
                data=purchase_order_details,
                message="Purchase order details retrieved successfully",
                success=True
            )
        except Exception as e:
            print("Error retrieving order details: ", e)
            return ServiceResult(
                error=f"Failed to get purchase order details: {e}",
                success=False
            )

    async def update_purchase_order_status(self, po_id: str, tenant_id: str, new_status: str) -> ServiceResult:
        """Update the status of a purchase order"""
        try:
            # Validate status
            valid_statuses = ["pending", "approved", "rejected", "received", "cancelled", "partial", "completed"]
            if new_status not in valid_statuses:
                return ServiceResult(
                    error=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
                    success=False
                )

            # Check if the purchase order exists
            existing_po = await self.repository.get_purchase_order_by_id(po_id, tenant_id)
            if not existing_po:
                return ServiceResult(
                    error="Purchase order not found",
                    success=False
                )

            # Update the purchase order status
            existing_po.status = new_status
            result = await self.repository.save(existing_po)
            if not result:
                return ServiceResult(
                    error="Purchase order update failed",
                    success=False
                )

            return ServiceResult(
                data=result,
                message=f"Purchase order status updated to {new_status} successfully",
                success=True
            )
        except Exception as e:
            return ServiceResult(
                error=f"Failed to update purchase order status: {e}",
                success=False
            )