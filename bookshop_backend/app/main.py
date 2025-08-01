from fastapi import FastAPI
from app.db.base import create_db_and_tables
from app.utils.redis_client import RedisClient

from app.modules.tenants.tenants_controller import router as tenants_router

app = FastAPI()
redis_client = RedisClient()
app.include_router(tenants_router)

@app.on_event("startup")
async def on_startup():
    create_db_and_tables()
    await redis_client.init()

@app.on_event("shutdown")
async def on_shutdown():
    await redis_client.close()
    
@app.get("/")
async def root():
    return {"message": "Hello World"}

