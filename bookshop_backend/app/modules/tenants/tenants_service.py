from ...db import models
from ...db.session import SessionDep
from .tenants_model import TenantCreate, TenantUpdate, TenantResponse
from logging import getLogger
from .tenants_repository import TenantRepository
from app.utils.result import ServiceResult
import uuid


logger = getLogger(__name__)


class TenantService:
    """
    Service for managing tenant operations.
    """

    def __init__(self, db: SessionDep):
        self.db = db 
        self.repo = TenantRepository(db)

    async def create_tenant(self, tenant_create: TenantCreate) -> ServiceResult:
        """
        Create a new tenant in the database.
        """
        try:
            existing = await self.repo.get_by_name(tenant_create.name)
            if existing:
                logger.error(f"Tenant with name '{tenant_create.name}' already exists.")
                return ServiceResult(
                    success=False,
                    error=f"Tenant with name '{tenant_create.name}' already exists."
                )
            
            new_tenant = models.Tenant(
                name=tenant_create.name,
                address=tenant_create.address,
                contact_email=tenant_create.contact_email,
                contact_phone=tenant_create.contact_phone
            )
            
            created_tenant = await self.repo.create_tenant(new_tenant)
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

    async def get_tenants(self) -> ServiceResult:
        """
        Retrieve a list of all tenants.
        """
        try:
            tenants = await self.repo.get_all()
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

    async def search_tenant(self, search_term: str) -> ServiceResult:
        """
        Search for tenants by name.
        """
        try:
            tenants = await self.repo.search_by_name(search_term)
            tenant_responses = [TenantResponse.model_validate(tenant) for tenant in tenants]
            
            return ServiceResult(
                data=tenant_responses,
                success=True
            )
        except Exception as e:
            logger.error(f"Error searching tenants: {e}")
            return ServiceResult(
                success=False,
                error=f"Failed to search tenants: {str(e)}"
            )

    async def update_tenant(self, tenant_id: uuid.UUID, tenant_update: TenantUpdate) -> ServiceResult:
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
            
            # Update tenant fields
            # check if the name to update is already taken
            if tenant_update.name:
                existing = await self.repo.get_by_name(tenant_update.name)
                if existing and existing.id != tenant_id:
                    return ServiceResult(
                        success=False,
                        error=f"Tenant with name '{tenant_update.name}' already exists."
                    )
            for key, value in tenant_update.model_dump(exclude_unset=True).items():
                setattr(tenant, key, value)
            
            updated_tenant = await self.repo.update_tenant(tenant)
            
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
