from ...db.session import SessionDep
from .user_model import UserCreate
from ...utils.result import ServiceResult
from ...utils.password_manager import hash_password
from .user_repository import UserRepository

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