<<<<<<< HEAD
from fastapi import FastAPI
=======
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
import httpx
from typing import Annotated

>>>>>>> 241e3c9d8ffec80c99dab4c32278e8d82d668750
from fastapi.middleware.cors import CORSMiddleware

from app.modules.tenants.tenants_controller import router as tenant_router
from app.modules.auth.auth_controller import router as auth_router
from .middleware.auth_middleware import AuthMiddleware

<<<<<<< HEAD
=======
from app.modules.tenants.tenants_controller import router as tenant_router
from app.modules.auth.auth_controller import router as auth_router
>>>>>>> 241e3c9d8ffec80c99dab4c32278e8d82d668750

app = FastAPI()
app.add_middleware(AuthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"], 
    allow_credentials=True,
    allow_methods=["GET", "POST", "HEAD", "OPTIONS", "PUT", "DELETE", "PATCH"],
    allow_headers=["Access-Control-Allow-Headers", "Content-Type", "Authorization", "Access-Control-Allow-Origin","Set-Cookie"],
)

app.include_router(
    tenant_router,
    prefix="/tenants",
    tags=["Tenants"],
    responses={404: {"description": "Not found"}},
)

app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Auth"],
    responses={404: {"description": "Not found"}},
)

@app.on_event("startup")
async def on_startup():
    pass

@app.get("/")
async def root():
    return {"message": "Hello World"}
