from fastapi import APIRouter, HTTPException, status, Form, Response, Request
from fastapi.responses import JSONResponse
from typing import Annotated

from app.db.session import SessionDep

from .auth_service import AuthService
from pydantic import BaseModel



router = APIRouter()

class UserCredentials(BaseModel):
    email: str
    password: str

@router.post('/login')
async def login(
    response: Response,
    credentials: Annotated[UserCredentials, Form(...)],
    db: SessionDep
    ):
    service = AuthService(db)

    auth_result = await service.authenticate_user(credentials.email, credentials.password)
    if not auth_result.success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=auth_result.error
        )

    login_result = await service.login_user(credentials.email, auth_result.data.role)
    if not login_result.success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )
    access_token = login_result.data["access_token"]
    refresh_token = login_result.data["refresh_token"]
    name = auth_result.data.name
    email = auth_result.data.email
    role = auth_result.data.role

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 7
    )
    return  JSONResponse(content={
        "email": email,
        "role": role,
        "name": name,
        "access_token": access_token,
        "token_type": "Bearer",
        "message": "Login successfull"
    })

@router.post("/refresh")
async def refresh(request: Request, db: SessionDep):
    service = AuthService(db)
    refresh_token = request.cookies.get("refresh_token")
        
    payload = await service.refresh_access_token(refresh_token)
    if payload.error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=payload.data.error
            )

    return JSONResponse(content={
        "access_token": payload.data["access_token"],
        "token_type": payload.data["Bearer"]
    })


@router.post("/logout")
async def logout(request: Request):
    response = JSONResponse(content={"message": "Logout successful"})
    response.delete_cookie("refresh_token")
    return response