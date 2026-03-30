from ...db.session import SessionDep
from .user_model import UserCreate, UserResponse
from ...utils.result import ServiceResult
from ...utils.password_manager import hash_password
from .user_repository import UserRepository
import uuid

class UserService:
    def __init__(self, db: SessionDep):
        self.repo = UserRepository(db)

    async def create_user(self, user_data: UserCreate) -> ServiceResult:
        """Create a new user in the database."""
        existing_user = await self.repo.get_user_by_email(user_data.email)
        if existing_user:
            return ServiceResult(
                success=False,
                error=f"User with email '{user_data.email}' already exists."
            )
        
        hashed_password = hash_password(user_data.password)
        user_data.password = hashed_password
        
        user_result = await self.repo.create_user(user_data)
        if not user_result:
            return ServiceResult(
                success=False,
                error="Failed to create user"
            )
        
        return ServiceResult(
            data=user_data,
            success=True,
            message="User created successfully"
        )

    async def check_email(self, email: str) -> ServiceResult:
        """Check if a user exists by email."""
        try:
            user = await self.repo.get_user_by_email(email)
            if user:
                return ServiceResult(
                    success=True,
                    data={ "exists": True }
                )
            
            return ServiceResult(
                success=True,
                data={ "exists": False }
            )
        except Exception as e:
            return ServiceResult(
                success=False,
                error=f"Failed to retrieve user: {str(e)}"
            )
    
    async def delete_user(self, user_id: str) -> ServiceResult:
        """Delete a user by ID."""
        try:
            user = await self.repo.get_user_by_email(user_id)
            if not user:
                return ServiceResult(
                    success=False,
                    error="User not found"
                )

            await self.repo.delete_user(user)
            return ServiceResult(success=True, message="User deleted successfully")
        except Exception as e:
            return ServiceResult(success=False, error=str(e))

    async def list_users_by_tenant(self, tenant_id: uuid.UUID) -> ServiceResult:
        try:
            users = await self.repo.list_users_by_tenant(tenant_id)
            data = [
                UserResponse.model_validate(user).model_dump()
                for user in users
            ]
            return ServiceResult(success=True, data=data)
        except Exception as e:
            return ServiceResult(success=False, error=f"Failed to retrieve users: {str(e)}")

    async def reset_user_password(self, user_id: uuid.UUID, tenant_id: uuid.UUID, new_password: str) -> ServiceResult:
        try:
            user = await self.repo.get_user_by_id(user_id)
            if not user:
                return ServiceResult(success=False, error="User not found")

            if user.tenant_id != tenant_id:
                return ServiceResult(success=False, error="You cannot update a user from another bookshop")

            user.password = hash_password(new_password)
            await self.repo.update_user(user)
            return ServiceResult(success=True, message="Password updated successfully")
        except Exception as e:
            return ServiceResult(success=False, error=f"Failed to reset password: {str(e)}")
