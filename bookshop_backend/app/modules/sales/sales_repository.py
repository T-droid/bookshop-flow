from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
import uuid
from .sales_model import Sales, SaleItem
from ...db import models
from typing import Union, List


class SalesRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_sale_by_id(self, sale_id: uuid.UUID, tenant_id: uuid.UUID) -> models.Sales | None:
        stmt = select(models.Sales).where(
            models.Sales.id == sale_id,
            models.Sales.tenant_id == tenant_id
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_sale(self, sale_data: Sales) -> uuid.UUID:
        new_sale = models.Sales(**sale_data.dict())
        await self.save(new_sale)
        return new_sale.id

    async def create_sale_item(self, sale_item_data: SaleItem, sale_id: uuid.UUID) -> models.SaleItems:
        new_sale_item = models.SaleItems(**sale_item_data.dict(), sale_id=sale_id)
        await self.save(new_sale_item)
        return new_sale_item

    async def get_sales_by_tenant(
        self,
        tenant_id: uuid.UUID,
        date_from: str = None,
        date_to: str = None,
        payment: str = None,
        status: str = None,
        limit: int = 100
    ):       
        try:
            print(f"Repository: Getting sales for tenant {tenant_id}")
            
            # First, get the basic sales data
            stmt = select(models.Sales).where(
                models.Sales.tenant_id == tenant_id
            )
            
            if date_from:
                stmt = stmt.where(models.Sales.created_at >= date_from)
            if date_to:
                stmt = stmt.where(models.Sales.created_at <= date_to)
            if payment:
                stmt = stmt.where(models.Sales.payment_method == payment)
            if status:
                stmt = stmt.where(models.Sales.sale_status == status)
            
            stmt = stmt.limit(limit).order_by(models.Sales.created_at.desc())
            
            result = await self.db.execute(stmt)
            sales_records = result.scalars().all()

            # For each sale, count the items separately
            sales_data = []
            for sale in sales_records:
                try:
                    # Count items for this sale
                    items_stmt = select(func.count(models.SaleItems.id)).where(
                        models.SaleItems.sale_id == sale.id
                    )
                    items_result = await self.db.execute(items_stmt)
                    items_count = items_result.scalar() or 0
                    
                    sales_data.append({
                        "sale_id": str(sale.id),
                        "date": sale.created_at.isoformat(),
                        "total_amount": float(sale.total_amount),
                        "sale_status": sale.sale_status,
                        "customer_name": sale.customer_name or "Walk-in Customer",
                        "customer_phone": sale.customer_phone,
                        "customer_email": sale.customer_email,
                        "payment_method": sale.payment_method,
                        "items": items_count,
                    })
                except Exception as sale_error:
                    print(f"Error processing sale {sale.id}: {sale_error}")
                    continue

            return sales_data
            
        except Exception as e:
            print(f"Repository error in get_sales_by_tenant: {str(e)}")
            import traceback
            traceback.print_exc()
            raise

    async def save(self, model: Union[models.Sales, models.SaleItems]) -> Union[models.Sales, models.SaleItems]:
        self.db.add(model)
        await self.db.commit()
        await self.db.refresh(model)
        return model