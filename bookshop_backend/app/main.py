from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.modules import api_router

from .middleware.auth_middleware import AuthMiddleware

app = FastAPI()
# app.add_middleware(AuthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"], 
    allow_credentials=True,
    allow_methods=["GET", "POST", "HEAD", "OPTIONS", "PUT", "DELETE", "PATCH"],
    allow_headers=["Access-Control-Allow-Headers", "Content-Type", "Authorization", "Access-Control-Allow-Origin","Set-Cookie"],
)

app.include_router(api_router)

@app.on_event("startup")
async def on_startup():
    pass

@app.get("/")
async def root():
    return {"message": "Hello World"}
