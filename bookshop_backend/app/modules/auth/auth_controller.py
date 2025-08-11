from fastapi import APIRouter, HTTPException, status, Body, Response, Request, Depends, Query
from fastapi.responses import JSONResponse
from .tokens import create_access_token, create_refresh_token, verify_refresh_token
from .auth_service import authenticate_user
from pydantic import BaseModel
from typing import Annotated


router = APIRouter()

class UserCredentials(BaseModel):
    email: str
    password: str

@router.post('/login', status_code=status.HTTP_202_ACCEPTED)
async def login(
    response: Response,
    credentials: Annotated[UserCredentials, Body(...)],
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
    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
    )
    return {
        "email": credentials.email,
        "access_token": access_token,
        "token_type": "Bearer",
        "message": "Login successfull"
    }

@router.post("/refresh")
async def refresh(request: Request):
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Refresh token missing")
    
    payload = verify_refresh_token(refresh_token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid refresh token")
    
    new_access_token = create_access_token(payload)
    return { "access_token": new_access_token, "token_type": "bearer"}