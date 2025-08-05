from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
import httpx
from typing import Annotated

from fastapi.middleware.cors import CORSMiddleware


from app.modules.tenants.tenants_controller import router as tenant_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"], 
    allow_credentials=True,
    allow_methods=["GET", "POST", "HEAD", "OPTIONS"],
    allow_headers=["Access-Control-Allow-Headers", "Content-Type", "Authorization", "Access-Control-Allow-Origin","Set-Cookie"],
)

app.include_router(
    tenant_router,
    prefix="/tenants",
    tags=["Tenants"],
    responses={404: {"description": "Not found"}},
)

@app.on_event("startup")
async def on_startup():
    pass

@app.get("/")
async def root():
    return {"message": "Hello World"}
