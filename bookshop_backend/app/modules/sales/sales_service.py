from ...db.session import SessionDep
from .sales_repository import SalesRepository
from .sales_model import SalesRequestBody, Sales, SaleItem, SaleResponse
from ...utils.result import ServiceResult
import uuid
import traceback
from ..inventory.inventory_service import InventoryService

class SalesService:
    def __init__(self, db: SessionDep):
        self.db = db
        self.repository = SalesRepository(db)
        self.inventory_service = InventoryService(db)

    async def create_sale(self, sale_data: SalesRequestBody, tenant_id: uuid.UUID=uuid.UUID("6e439a65-0e33-4181-8773-7a48df2bdfdf")) -> ServiceResult:
        try:            
            sale_id = await self.repository.create_sale(
                Sales(
                    tenant_id=tenant_id,
                    total_amount=sale_data.total_amount,
                    sale_status=sale_data.sale_status,
                    customer_name=sale_data.customer.customer_name if sale_data.customer else None,
                    customer_phone=sale_data.customer.customer_phone if sale_data.customer else None,
                    customer_email=sale_data.customer.customer_email if sale_data.customer else None,
                    amount_received=sale_data.payment.amount_received,
                    change_given=sale_data.payment.change_given,
                    payment_method=sale_data.payment.payment_method,
                )
            )
            sale_items = sale_data.sale_items
            for item in sale_items:
                result =await self.inventory_service.update_inventory_quantity(
                    inventory_id=item.inventory_id,
                    quantity=-item.quantity_sold
                )
                if result.error:
                    raise Exception(f"Failed to update inventory: {result.error}")
                await self.repository.create_sale_item(
                    SaleItem(
                        edition_id=item.edition_id,
                        inventory_id=item.inventory_id,
                        isbn=item.isbn,
                        title=item.title,
                        author=item.author,
                        quantity_sold=item.quantity_sold,
                        price_per_unit=item.price_per_unit,
                        total_price=item.total_price,
                        tax_amount=item.tax_amount,
                        discount_amount=item.discount_amount
                    ),
                    sale_id=sale_id
                )

            return ServiceResult(
                success=True,
                data={"sale_id": sale_id}
            )
        except Exception as e:
            return ServiceResult(
                success=False,
                error=f"Failed to create sale: {str(e)}"
            )
        
    async def get_sales_by_tenant(
        self, 
        tenant_id: uuid.UUID,
        date_from: str = None,
        date_to: str = None,
        payment: str = None,
        status: str = None,
        limit: int = 100
    ) -> ServiceResult:
        """Get all sales for a tenant with optional filters"""
        try:            
            sales = await self.repository.get_sales_by_tenant(
                tenant_id=tenant_id,
                date_from=date_from,
                date_to=date_to,
                payment=payment,
                status=status,
                limit=limit
            )
            
            # Validate each sale response format
            validated_sales = []
            for i, sale in enumerate(sales or []):
                try:
                    validated_sale = SaleResponse.model_validate(sale)
                    validated_sales.append(validated_sale.model_dump())
                except Exception as validation_error:
                    print(f"Error validating sale {i+1} with data {sale}: {validation_error}")
                    continue            
            return ServiceResult(
                success=True,
                data=validated_sales
            )
        except Exception as e:
            print(f"Service error in get_sales_by_tenant: {str(e)}")
            import traceback
            traceback.print_exc()
            return ServiceResult(
                success=False,
                error=f"Failed to retrieve sales: {str(e)}"
            )