from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from ...db import models
from .user_model import UserCreate

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> models.User | None:
        stmt = select(models.User).where(models.User.email == email)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: uuid.UUID) -> models.User | None:
        stmt = select(models.User).where(models.User.id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_users_by_tenant(self, tenant_id: uuid.UUID) -> list[models.User]:
        stmt = select(models.User).where(models.User.tenant_id == tenant_id).order_by(models.User.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create_user(self, user: UserCreate) -> models.User:
        user = models.User(**user.dict())
        return await self.save(user)

    async def update_user(self, user: models.User) -> models.User:
        return await self.save(user)
    
    async def delete_user(self, user: models.User) -> None:
        """Delete a user from the database."""
        await self.db.delete(user)
        await self.db.commit()

    async def save(self, user: models.User) -> None:
        """Save a user to the database."""
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
