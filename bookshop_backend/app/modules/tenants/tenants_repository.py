from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from ...db import models
from .tenants_model import TenantCreate, TenantUpdate
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

    async def create_tenant(self, tenant: TenantCreate) -> models.Tenant:
        """
        Create a new tenant in the database.
        """
        db_tenant = models.Tenant(**tenant.model_dump())  # Changed from dict() to model_dump()
        return await self.save(db_tenant)

    async def get_by_id(self, tenant_id: uuid.UUID) -> Optional[models.Tenant]:
        """Get tenant by ID"""
        stmt = select(models.Tenant).where(models.Tenant.id == tenant_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_all(self, name: Optional[str] = None, email: Optional[str] = None, created_at: Optional[str] = None) -> List[models.Tenant]:
        """Get all tenants with optional filters"""
        stmt = select(models.Tenant)
        
        # Apply filters if provided
        if name:
            stmt = stmt.where(models.Tenant.name.ilike(f"%{name}%"))  # Use ilike for case-insensitive partial match
        if email:
            stmt = stmt.where(models.Tenant.contact_email.ilike(f"%{email}%"))  # Fixed field name
        if created_at:
            # You might want to parse this date string properly
            stmt = stmt.where(models.Tenant.created_at >= created_at)
        
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def search_by_name(self, search_term: str) -> List[models.Tenant]:
        """Search tenants by name"""
        stmt = select(models.Tenant).where(
            models.Tenant.name.ilike(f"%{search_term}%")
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def delete_tenant(self, tenant: models.Tenant) -> None:
        """Delete tenant"""
        await self.db.delete(tenant)
        await self.db.commit()

    async def save(self, tenant: models.Tenant) -> models.Tenant:
        """Save tenant"""
        self.db.add(tenant)
        await self.db.commit()
        await self.db.refresh(tenant)
        return tenant