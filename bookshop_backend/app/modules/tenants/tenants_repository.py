from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from ...db import models
import uuid

class TenantRepository:
    """
    Repository for managing tenant database operations.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_name(self, name: str) -> Optional[models.Tenant]:
        """
        Retrieve a tenant by name.
        """
        stmt = select(models.Tenant).where(models.Tenant.name == name)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def create_tenant(self, tenant: models.Tenant) -> models.Tenant:
        """
        Create a new tenant in the database.
        """
        self.db.add(tenant)
        await self.db.commit()
        await self.db.refresh(tenant)
        return tenant

    async def get_by_id(self, tenant_id: uuid.UUID) -> Optional[models.Tenant]:
        """Get tenant by ID"""
        stmt = select(models.Tenant).where(models.Tenant.id == tenant_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_all(self) -> List[models.Tenant]:
        """Get all tenants"""
        stmt = select(models.Tenant)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def search_by_name(self, search_term: str) -> List[models.Tenant]:
        """Search tenants by name"""
        stmt = select(models.Tenant).where(models.Tenant.name.ilike(f"%{search_term}%"))
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def update_tenant(self, tenant: models.Tenant) -> models.Tenant:
        """Update tenant"""
        await self.db.commit()
        await self.db.refresh(tenant)
        return tenant

    async def delete_tenant(self, tenant: models.Tenant) -> None:
        """Delete tenant"""
        await self.db.delete(tenant)
        await self.db.commit()