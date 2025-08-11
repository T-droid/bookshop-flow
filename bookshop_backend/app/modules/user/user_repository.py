from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ...db import models
from .user_model import UserCreate

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> models.User | None:
        stmt = select(models.User).where(models.User.email == email)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_user(self, user: UserCreate) -> models.User:
        user = models.User(**user.dict())
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