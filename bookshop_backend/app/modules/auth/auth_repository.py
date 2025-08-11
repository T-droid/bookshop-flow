from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from ...db import models

class AuthRepository:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session

    async def get_user_by_email(self, email: str) -> Optional[models.User]:
        """Retrieve a user by email."""
        if email == "admin@bookshop.com":
            return await self._get_superadmin_by_email(email)             
        
        stmt = select(models.User).where(models.User.email == email)
        result = await self.db_session.execute(stmt)
        return result.scalars().first()
    
    async def _get_superadmin_by_email(self, email: str) -> Optional[models.SuperAdmin]:
        """Retrieve a superadmin by email."""
        stmt = select(models.SuperAdmin).where(models.SuperAdmin.email == email)
        result = await self.db_session.execute(stmt)
        return result.scalars().first()
    
    
    async def create_user(self, user_data):
        pass

    
