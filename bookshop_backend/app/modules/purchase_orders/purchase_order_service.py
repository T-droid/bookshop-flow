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
    
    # async def get_purchase_orders(self, tenant_id: uuid.UUID, limit: int = 100) -> ServiceResult:
    #     try:
    #         print(f"Service: Getting purchase orders for tenant {tenant_id}")
            
    #         # Get purchase orders from repository
    #         purchase_orders = await self.repository.get_purchase_orders_by_tenant(tenant_id, limit)
    #         print(f"Repository returned {len(purchase_orders)} purchase orders")
            
    #         # Convert to response format
    #         response_data = []
    #         for po in purchase_orders:
    #             po_response = PurchaseOrderResponse.model_validate(po)
    #             response_data.append(po_response)
            
    #         return ServiceResult(
    #             data=response_data,
    #             success=True
    #         )
            
    #     except Exception as e:
    #         print(f"Service error: {str(e)}")
    #         import traceback
    #         traceback.print_exc()
    #         return ServiceResult(
    #             error=f"Failed to get purchase orders: {str(e)}",
    #             success=False
    #         )