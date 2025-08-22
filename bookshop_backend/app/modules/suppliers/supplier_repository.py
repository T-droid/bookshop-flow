from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import List, Optional, Union
import uuid
from ...db import models
from .supplier_model import SupplierCreate

class SupplierRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_supplier(self, supplier_data: SupplierCreate) -> models.Supplier:
        new_supplier = models.Supplier(**supplier_data.dict())
        await self.save(new_supplier)
        return new_supplier.id

    async def add_tenant_to_supplier(self, supplier_id: uuid.UUID, tenant_id: uuid.UUID) -> models.TenantSupplier:
        tenant_supplier = models.TenantSupplier(tenant_id=tenant_id, supplier_id=supplier_id)
        await self.save(tenant_supplier)
        return tenant_supplier
    
    async def get_supplier_by_name_and_email(self, name: str, contact_info: str) -> Optional[models.Supplier]:
        result = await self.db.execute(
            select(models.Supplier).where(
                models.Supplier.name == name,
                models.Supplier.contact_info == contact_info
            )
        )
        return result.scalar_one_or_none()

    async def get_supplier_by_id(self, supplier_id: uuid.UUID) -> Optional[models.Supplier]:
        result = await self.db.execute(select(models.Supplier).where(models.Supplier.id == supplier_id))
        return result.scalar_one_or_none()
    
    async def check_tenant_supplier_exists(self, tenant_id: uuid.UUID, supplier_id: uuid.UUID) -> bool:
        result = await self.db.execute(
            select(models.TenantSupplier).where(
                models.TenantSupplier.tenant_id == tenant_id,
                models.TenantSupplier.supplier_id == supplier_id
            )
        )
        return result.scalar_one_or_none() is not None

    async def list_suppliers(self, tenant_id: uuid.UUID) -> List[models.Supplier]:
        result = await self.db.execute(select(models.Supplier).where(models.Supplier.tenant_id == tenant_id))
        return result.scalars().all()

    async def save(self, model: Union[models.Supplier, models.TenantSupplier]) -> Union[models.Supplier, models.TenantSupplier]:
        self.db.add(model)
        await self.db.commit()
        await self.db.refresh(model)
        return model