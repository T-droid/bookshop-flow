from ...db.session import SessionDep
from .auth_repository import AuthRepository
from ...utils.result import ServiceResult
from ...utils.password_manager import hash_password, verify_password
<<<<<<< HEAD
from ...utils.tokens import create_access_token, create_refresh_token, verify_refresh_token
from typing import Dict
=======
from .tokens import create_access_token, create_refresh_token, verify_refresh_token
>>>>>>> 241e3c9d8ffec80c99dab4c32278e8d82d668750

class AuthService:
    def __init__(self, db: SessionDep):
        self.db = db
        self.auth_repo = AuthRepository(db)

    async def authenticate_user(self, email: str, password: str) -> ServiceResult:
        user = await self.auth_repo.get_user_by_email(email)
        if user:
            if verify_password(password, user.password):
                return ServiceResult(
                    data=user,
                    success=True
                )
        return ServiceResult(
            success=False,
            error="Invalid email or password"
        )
    
    async def login_user(self, email: str, role: str) -> ServiceResult:
        access_token: str = create_access_token({"email": email, "role": role})
        refresh_token: str = create_refresh_token({"email": email, "role": role})
        return ServiceResult(
            data={
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "Bearer"
            },
            success=True
        )
    
    async def refresh_access_token(self, refresh_token: str) -> ServiceResult:
        payload = verify_refresh_token(refresh_token)
        print(f"***** {payload} *****")
        if not payload:
            return ServiceResult(
                success=False,
                error="Invalid refresh token"
            )
        
        new_access_token = create_access_token(payload)
        return ServiceResult(
            data={
                "access_token": new_access_token,
                "token_type": "Bearer"
            },
            success=True
        )
