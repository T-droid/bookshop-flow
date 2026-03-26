from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
import uuid
from .sales_model import Sales, SaleItem
from ...db import models
from typing import Union, List
from datetime import datetime
from decimal import Decimal


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

    async def get_dashboard_summary(self, tenant_id: uuid.UUID, recent_limit: int = 5):
        now = datetime.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        today_stmt = select(
            func.count(models.Sales.id),
            func.coalesce(func.sum(models.Sales.total_amount), 0)
        ).where(
            models.Sales.tenant_id == tenant_id,
            models.Sales.created_at >= today_start
        )
        today_result = await self.db.execute(today_stmt)
        today_sales_count, today_revenue = today_result.one()

        month_stmt = select(
            func.coalesce(func.sum(models.Sales.total_amount), 0)
        ).where(
            models.Sales.tenant_id == tenant_id,
            models.Sales.created_at >= month_start
        )
        month_result = await self.db.execute(month_stmt)
        monthly_revenue = month_result.scalar_one()

        recent_sales = await self.get_sales_by_tenant(tenant_id=tenant_id, limit=recent_limit)

        return {
            "today_sales_count": today_sales_count or 0,
            "today_revenue": today_revenue or 0,
            "monthly_revenue": monthly_revenue or 0,
            "recent_sales": recent_sales or []
        }

    async def get_reports_summary(self, tenant_id: uuid.UUID):
        total_stmt = select(
            func.count(models.Sales.id),
            func.coalesce(func.sum(models.Sales.total_amount), 0)
        ).where(models.Sales.tenant_id == tenant_id)
        total_result = await self.db.execute(total_stmt)
        total_transactions, total_revenue = total_result.one()

        monthly_stmt = (
            select(
                func.date_trunc('month', models.Sales.created_at).label("month_start"),
                func.coalesce(func.sum(models.Sales.total_amount), 0).label("revenue"),
                func.count(models.Sales.id).label("transactions")
            )
            .where(models.Sales.tenant_id == tenant_id)
            .group_by(func.date_trunc('month', models.Sales.created_at))
            .order_by(func.date_trunc('month', models.Sales.created_at).desc())
            .limit(6)
        )
        monthly_result = await self.db.execute(monthly_stmt)
        monthly_rows = monthly_result.all()
        monthly_sales = [
            {
                "month": row.month_start.strftime("%B %Y"),
                "revenue": row.revenue,
                "transactions": row.transactions
            }
            for row in reversed(monthly_rows)
        ]

        best_sellers_stmt = (
            select(
                models.SaleItems.title,
                models.SaleItems.isbn,
                func.sum(models.SaleItems.quantity_sold).label("units_sold"),
                func.sum(models.SaleItems.total_price).label("revenue")
            )
            .select_from(models.SaleItems)
            .join(models.Sales, models.SaleItems.sale_id == models.Sales.id)
            .where(models.Sales.tenant_id == tenant_id)
            .group_by(models.SaleItems.title, models.SaleItems.isbn)
            .order_by(func.sum(models.SaleItems.quantity_sold).desc(), func.sum(models.SaleItems.total_price).desc())
            .limit(10)
        )
        best_sellers_result = await self.db.execute(best_sellers_stmt)
        best_sellers_rows = best_sellers_result.all()
        best_sellers = [
            {
                "title": row.title,
                "isbn": row.isbn,
                "units_sold": row.units_sold or 0,
                "revenue": row.revenue or Decimal("0")
            }
            for row in best_sellers_rows
        ]

        return {
            "total_revenue": total_revenue or Decimal("0"),
            "total_transactions": total_transactions or 0,
            "average_order_value": (Decimal(str(total_revenue)) / total_transactions) if total_transactions else Decimal("0"),
            "monthly_sales": monthly_sales,
            "best_sellers": best_sellers
        }

    async def save(self, model: Union[models.Sales, models.SaleItems]) -> Union[models.Sales, models.SaleItems]:
        self.db.add(model)
        await self.db.commit()
        await self.db.refresh(model)
        return model
