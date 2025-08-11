from ...db import models
from ...db.session import SessionDep
from .tenants_model import TenantCreate, TenantUpdate, TenantResponse
from logging import getLogger
from .tenants_repository import TenantRepository
from app.utils.result import ServiceResult
import uuid

from typing import Optional

logger = getLogger(__name__)


class TenantService:
    """
    Service for managing tenant operations.
    """

    def __init__(self, db: SessionDep):
        self.db = db 
        self.repo = TenantRepository(db)

    async def create_tenant(self, tenant_create_data: TenantCreate) -> ServiceResult:
        """
        Create a new tenant in the database.
        """
        try:
            existing = await self.repo.get_by_name(tenant_create_data.name)
            if existing:
                logger.error(f"Tenant with name '{tenant_create_data.name}' already exists.")
                return ServiceResult(
                    success=False,
                    error=f"Tenant with name '{tenant_create_data.name}' already exists."
                )
            
            created_tenant = await self.repo.create_tenant(tenant_create_data)
            logger.info(f"Tenant '{created_tenant.name}' created successfully.")
            
            return ServiceResult(
                data=TenantResponse.model_validate(created_tenant),
                success=True
            )
        except Exception as e:
            logger.error(f"Error creating tenant: {e}")
            return ServiceResult(
                success=False,
                error=f"Failed to create tenant: {str(e)}"
            )

    async def get_tenants(self, name: Optional[str] = None, email: Optional[str] = None, created_at: Optional[str] = None) -> ServiceResult:
        """
        Retrieve a list of all tenants.
        """
        try:
            tenants = await self.repo.get_all(name=name, email=email, created_at=created_at)
            tenant_responses = [TenantResponse.model_validate(tenant) for tenant in tenants]

            return ServiceResult(
                data=tenant_responses,
                success=True
            )
        except Exception as e:
            logger.error(f"Error fetching tenants: {e}")
            return ServiceResult(
                success=False,
                error=f"Failed to fetch tenants: {str(e)}"
            )

    async def get_tenant_by_id(self, tenant_id: uuid.UUID) -> ServiceResult:
        """
        Retrieve a tenant by ID.
        """
        try:
            tenant = await self.repo.get_by_id(tenant_id)
            if not tenant:
                return ServiceResult(
                    success=False,
                    error=f"Tenant with ID '{tenant_id}' not found."
                )
            
            return ServiceResult(
                data=TenantResponse.model_validate(tenant),
                success=True
            )
        except Exception as e:
            logger.error(f"Error fetching tenant {tenant_id}: {e}")
            return ServiceResult(
                success=False,
                error=f"Failed to fetch tenant: {str(e)}"
            )

    async def update_tenant(self, tenant_id: uuid.UUID, tenant_update_data: TenantUpdate) -> ServiceResult:
        """
        Update an existing tenant.
        """
        try:
            tenant = await self.repo.get_by_id(tenant_id)
            if not tenant:
                return ServiceResult(
                    success=False,
                    error=f"Tenant with ID '{tenant_id}' not found."
                )

            if tenant_update_data.name and tenant_update_data.name != tenant.name:
                existing = await self.repo.get_by_name(tenant_update_data.name)
                if existing:
                    return ServiceResult(
                        success=False,
                        error=f"Tenant with name '{tenant_update_data.name}' already exists."
                    )
                tenant.name = tenant_update_data.name or tenant.name

            for field, value in tenant_update_data.model_dump(exclude_unset=True).items():
                value = getattr(tenant_update_data, field, None)
                if value is not None and value != "":
                    setattr(tenant, field, value)

            updated_tenant = await self.repo.save(tenant)
            logger.info(f"Tenant '{updated_tenant.name}' updated successfully.")
            return ServiceResult(
                data=TenantResponse.model_validate(updated_tenant),
                success=True
            )
        except Exception as e:
            logger.error(f"Error updating tenant {tenant_id}: {e}")
            return ServiceResult(
                success=False,
                error=f"Failed to update tenant: {str(e)}"
            )

    async def delete_tenant(self, tenant_id: uuid.UUID) -> ServiceResult:
        """
        Delete a tenant.
        """
        try:
            tenant = await self.repo.get_by_id(tenant_id)
            if not tenant:
                return ServiceResult(
                    success=False,
                    error=f"Tenant with ID '{tenant_id}' not found."
                )
            
            await self.repo.delete_tenant(tenant)
            
            return ServiceResult(
                success=True,
                message=f"Tenant '{tenant.name}' deleted successfully."
            )
        except Exception as e:
            logger.error(f"Error deleting tenant {tenant_id}: {e}")
            return ServiceResult(
                success=False,
                error=f"Failed to delete tenant: {str(e)}"
            )