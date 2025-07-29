from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
import httpx
from typing import Annotated

from app.db.base import create_db_and_tables
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("WEBSITE_DOMAIN"), os.getenv("AUTH_SERVICE_DOMAIN")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{os.getenv('AUTH_SERVICE_DOMAIN')}/auth/signin")


async def proxy_to_auth_service(endpoint: str, data: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{os.getenv('AUTH_SERVICE_DOMAIN')}/auth{endpoint}", json=data)
        return response.json()
    
@app.post("/login")
async def login(data: dict):
    result = await proxy_to_auth_service("/login", data)
    if "status" in result and result["status"] == "OK":
        return {"access_token": result.get("accessToken"), "token_type": "bearer"}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

@app.get("/protected")
async def protected_route(token: Annotated[str, Depends(oauth2_scheme)]):
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.get(f"{os.getenv('AUTH_SERVICE_DOMAIN')}/auth/session/verify", headers=headers)
        if response.status_code == 200:
            return {"message": "Access granted", "User": response.json().get("user")}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@app.on_event("startup")
async def on_startup():
    create_db_and_tables()

@app.get("/")
async def root():
    return {"message": "Hello World"}

