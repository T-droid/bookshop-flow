from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
import uuid
from .sales_model import Sales, SaleItem
from ....db import models
from typing import Union


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

    async def save(self, model: Union[models.Sales, models.SaleItems]) -> Union[models.Sales, models.SaleItems]:
        self.db.add(model)
        await self.db.commit()
        await self.db.refresh(model)
        return model