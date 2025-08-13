from sqlalchemy.exc import IntegrityError
from ...db.session import SessionDep
from ...utils.result import ServiceResult
from ..user.user_service import UserService
from ..user.user_model import UserCreate
from ..tenants.tenants_service import TenantService


class OnboardingService:
    def __init__(self, db: SessionDep):
        self.db = db
        self.user_service = UserService(db)
        self.tenants_service = TenantService(db)

    async def create_tenant_with_admin(self, tenant_data, user_data: UserCreate) -> ServiceResult:
        tenant_result = None
        try:
            # Create tenant first (without transaction wrapper)
            tenant_result = await self.tenants_service.create_tenant(tenant_data)
            if not tenant_result.success:
                return ServiceResult(success=False, error=tenant_result.error)
            
            # Set tenant ID for the user
            user_data.tenant_id = tenant_result.data.id
            user_data.user_role = "admin"
            
            # Create admin user
            user_result = await self.user_service.create_user(user_data)
            if not user_result.success:
                # If user creation fails, rollback by deleting the tenant
                try:
                    await self.tenants_service.delete_tenant(str(tenant_result.data.id))
                except Exception as cleanup_error:
                    print(f"Failed to cleanup tenant after user creation error: {cleanup_error}")
                
                return ServiceResult(success=False, error=f"Failed to create admin user: {user_result.error}")

            return ServiceResult(
                data={
                    "tenant": tenant_result.data,
                    "user": user_result.data
                },
                success=True,
                message="Tenant and admin user created successfully"
            )
        except IntegrityError as e:
            # Cleanup tenant if it was created
            if tenant_result and tenant_result.success:
                try:
                    await self.tenants_service.delete_tenant(str(tenant_result.data.id))
                except Exception as cleanup_error:
                    print(f"Failed to cleanup tenant after integrity error: {cleanup_error}")
            
            return ServiceResult(success=False, error=f"Database integrity error: {str(e)}")
        except Exception as e:
            # Cleanup tenant if it was created
            if tenant_result and tenant_result.success:
                try:
                    await self.tenants_service.delete_tenant(str(tenant_result.data.id))
                except Exception as cleanup_error:
                    print(f"Failed to cleanup tenant after error: {cleanup_error}")
            
            return ServiceResult(success=False, error=f"Failed to create tenant: {str(e)}")
        
    async def get_tenants(self) -> ServiceResult:
        """List all tenants."""
        try:
            result = await self.tenants_service.get_tenants()
            if not result.success:
                return ServiceResult(success=False, error=result.error)
            return ServiceResult(data=result.data, success=True)
        except Exception as e:
            return ServiceResult(success=False, error=str(e))
        
    async def check_tenant_name(self, name: str) -> ServiceResult:
        """Check if a tenant name is available."""
        try:
            result = await self.tenants_service.check_tenant_name(name)
            if not result.success:
                return ServiceResult(success=False, error=result.error)
            return ServiceResult(data=result.data, success=True)
        except Exception as e:
            return ServiceResult(success=False, error=str(e))

    async def check_admin_email(self, email: str) -> ServiceResult:
        """Check if an admin email is available."""
        try:
            result = await self.user_service.check_email(email)
            if not result.success:
                return ServiceResult(success=False, error=result.error)
            return ServiceResult(data=result.data, success=True)
        except Exception as e:
            return ServiceResult(success=False, error=str(e))

    async def get_tenant_by_id(self, tenant_id: str) -> ServiceResult:
        """Get a tenant by ID."""
        try:
            result = await self.tenants_service.get_tenant_by_id(tenant_id)
            if not result.success:
                return ServiceResult(success=False, error=result.error)
            return ServiceResult(data=result.data, success=True)
        except Exception as e:
            return ServiceResult(success=False, error=str(e))
            
    async def remove_tenant(self, tenant_id: str) -> ServiceResult:
        """Remove a tenant and its associated users."""
        try:
            # Remove tenant and associated users
            result = await self.tenants_service.delete_tenant(tenant_id)
            if not result.success:
                return ServiceResult(success=False, error=result.error)

            return ServiceResult(success=True, message="Tenant removed successfully")
        except Exception as e:
            return ServiceResult(success=False, error=str(e))