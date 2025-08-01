from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

sqlite_file_name = "database.db"
sqlite_url = "sqlite+aiosqlite:///./bookshops.db"

connect_args = {"check_same_thread": False}
async_engine = create_async_engine(sqlite_url, connect_args=connect_args)

async def create_db_and_tables():
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

# Create a sessionmaker that will produce AsyncSession objects
async_session_maker = sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)
