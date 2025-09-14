from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import List, Optional
import uuid
from ...db import models
from .tax_model import CreateTaxModel


class TaxRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_tax_rate(self, tax_rate_data: CreateTaxModel, tenant_id: uuid.UUID) -> models.TaxRates:
        tax_rate = models.TaxRates(
            name=tax_rate_data.taxName.lower(),
            rate=tax_rate_data.taxRate,
            default=tax_rate_data.isDefault,
            description=tax_rate_data.description, 
            effective_date=tax_rate_data.effectiveDate,
            tenant_id=tenant_id
            )
        await self.save(tax_rate)
        return tax_rate
    
    async def get_tax_rate_by_id(self, tax_rate_id: uuid.UUID) -> Optional[models.TaxRates]:
        result = await self.db.execute(select(models.TaxRates).where(models.TaxRates.id == tax_rate_id))
        return result.scalar_one_or_none()

    async def get_tax_rate_by_name(self, name: str, tenant_id: uuid.UUID) -> Optional[models.TaxRates]:
        result = await self.db.execute(
            select(models.TaxRates).where(models.TaxRates.name == name, models.TaxRates.tenant_id == tenant_id)
        )
        return result.scalar_one_or_none()
    
    async def get_default_tax_rate(self, tenant_id: uuid.UUID) -> Optional[models.TaxRates]:
        result = await self.db.execute(
            select(models.TaxRates).where(
                models.TaxRates.tenant_id == tenant_id,
                models.TaxRates.default == True
            )
        )
        return result.scalar_one_or_none()

    async def list_tax_rates_by_tenant(self, tenant_id: uuid.UUID) -> List[models.TaxRates]:
        stmt = select(models.TaxRates).where(models.TaxRates.tenant_id == tenant_id)
        result = await self.db.execute(stmt)
        result = result.scalars().all()

        return [{
            "id": tax_rate.id,
            "taxName": tax_rate.name,
            "taxRate": tax_rate.rate,
            "description": tax_rate.description,
            "isDefault": tax_rate.default,
            "effectiveDate": tax_rate.effective_date
        } for tax_rate in result]

    async def save(self, tax_rate: models.TaxRates) -> models.TaxRates: 
        self.db.add(tax_rate)
        await self.db.commit()
        await self.db.refresh(tax_rate)
        return tax_rate