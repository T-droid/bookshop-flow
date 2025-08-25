from ...db.session import SessionDep
from .auth_repository import AuthRepository
from ...utils.result import ServiceResult
from ...utils.password_manager import verify_password
from ...utils.password_manager import hash_password, verify_password
from ...utils.tokens import create_access_token, create_refresh_token, verify_refresh_token
from ...db import models

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

    async def login_user(self, user: models.User) -> ServiceResult:
        tenant_id = getattr(user, "tenant_id", None)
        access_token: str = create_access_token({
            "email": user.email,
            "role": user.role,
            "user_id": str(user.id),
            "tenant_id": str(tenant_id) if tenant_id else None
        })
        refresh_token: str = create_refresh_token({
            "email": user.email,
            "role": user.role,
            "user_id": str(user.id),
            "tenant_id": str(tenant_id) if tenant_id else None
        })
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
        if not payload:
            return ServiceResult(
                success=False,
                error="Invalid refresh token"
            )
        
        new_access_token = create_access_token(payload)
        return ServiceResult(
            data={
                "access_token": new_access_token,
                "token_type": "Bearer",
                "role": payload.get("role")
            },
            success=True
        )
