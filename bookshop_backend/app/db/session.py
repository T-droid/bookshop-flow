from typing import AsyncGenerator
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from .base import async_session_maker

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session

# This is the dependency that you will use in your FastAPI path operations
SessionDep = Annotated[AsyncSession, Depends(get_session)]