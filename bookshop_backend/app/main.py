from fastapi import FastAPI
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware

from app.modules import api_router

from .middleware.auth_middleware import AuthMiddleware

app = FastAPI(
    title="Bookshop flow api",
    description="Backend API for Bookshop flow application",
    version="1.0.0",
)
# app.add_middleware(AuthMiddleware)
security = HTTPBearer()

def custom_openapi_auth():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT token"
        }
    }
    openapi_schema["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.add_middleware(
    CORSMiddleware,
<<<<<<< HEAD
    allow_origins=["http://localhost:5173", "http://localhost:8080", "https://bookshop-flow.vercel.app"], 
=======
    allow_origins=["http://localhost:5173", "http://localhost:8080", "https://bookshop-flow-git-main-emmanuel-tindis-projects.vercel.app"], 
>>>>>>> 39be50069ab136e9a5ca8a61eaffad57ab66280e
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
