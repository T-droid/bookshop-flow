from fastapi import FastAPI
from app.db.base import create_db_and_tables
from fastapi.middleware.cors import CORSMiddleware


from app.modules.auth.auth_controller import router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"], 
    allow_credentials=True,
    allow_methods=["GET", "POST", "HEAD", "OPTIONS"],
    allow_headers=["Access-Control-Allow-Headers", "Content-Type", "Authorization", "Access-Control-Allow-Origin","Set-Cookie"],
)

app.include_router(
    router,
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)

@app.on_event("startup")
async def on_startup():
    create_db_and_tables()

@app.get("/")
async def root():
    return {"message": "Hello World"}

