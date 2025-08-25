from fastapi import APIRouter, HTTPException, status, Body, Response, Request, Depends, Query
from fastapi.responses import JSONResponse
from .auth_service import AuthService
from pydantic import BaseModel
from typing import Annotated
from ...db.session import SessionDep


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

    login_result = await service.login_user(auth_result.data)
    if not login_result.success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )
    access_token = login_result.data["access_token"]
    refresh_token = login_result.data["refresh_token"]

    name = getattr(auth_result.data, "name", None) or getattr(auth_result.data, "full_name", None)
    email = auth_result.data.email
    role = auth_result.data.role

    response = JSONResponse(content={
        "email": email,
        "role": role,
        "name": name,
        "access_token": access_token,
        "token_type": "Bearer",
        "message": "Login successful"})
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
    )
    return response

@router.post("/refresh", status_code=status.HTTP_201_CREATED)
async def refresh(request: Request, db: SessionDep):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing refresh token"
        )

    service = AuthService(db)
    payload = await service.refresh_access_token(refresh_token)

    if payload.error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=payload.error
        )

    return JSONResponse(content={
        "access_token": payload.data["access_token"],
        "token_type": payload.data["token_type"],
        "role": payload.data["role"]
    })


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(response: Response):
    response = JSONResponse(content={"message": "Logout successful"})
    response.delete_cookie("refresh_token")
    return response
