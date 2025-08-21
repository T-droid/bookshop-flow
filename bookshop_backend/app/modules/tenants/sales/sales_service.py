from ....db.session import SessionDep
from .sales_repository import SalesRepository
from .sales_model import SalesRequestBody, Sales, SaleItem
from ....utils.result import ServiceResult
import uuid
from ...inventory.inventory_service import InventoryService

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