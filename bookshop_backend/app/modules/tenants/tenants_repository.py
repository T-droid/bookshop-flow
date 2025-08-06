from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from ...db import models
import uuid
from .tenants_model import TenantUpdate
from ...db.session import SessionDep

class TenantRepository:
    """
    Repository for managing tenant database operations.
    """

    def __init__(self, db: SessionDep):
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

    async def update_tenant(self, tenant:TenantUpdate)-> models.Tenant:
        """Update tenant"""
        stmt = select(models.Tenant).where(models.Tenant.id == tenant.id)
        existing_tenant = await self.db(stmt)
        results = existing_tenant.scalar_one_or_none()
        
        print("results:" , results if isinstance(results, models.Tenant) else "No tenant found")

        if not results:
            return None
        
        
        if tenant.name:
            existing = await self.get_by_name(tenant.name)
            if existing and existing.id != tenant.id:
                raise ValueError(f"Tenant with name '{tenant.name}' already exists.")
            results.name = tenant.name
            self.db.add(results)
        if tenant.contact_email:
            results.contact_email = tenant.contact_email
            self.db.add(results)
        if tenant.contact_phone:
            results.contact_phone = tenant.contact_phone
            self.db.add(results)
        if tenant.address:
            results.address = tenant.address    
            self.db.add(results)

        print("results after update:", results)
        await self.db.commit()
        await self.db.refresh(results)
        return results

    async def delete_tenant(self, tenant: models.Tenant) -> None:
        """Delete tenant"""
        await self.db.delete(tenant)
        await self.db.commit()