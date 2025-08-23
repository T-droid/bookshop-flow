from fastapi import Depends, Request, HTTPException, status
from .tokens import decode_access_token
from typing import List


def get_current_user(request: Request):
    """
    Extracts the current user from the request by decoding the access token.
    """
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "email": payload.get("email"),
        "role": payload.get("role"),
        "user_id": payload.get("user_id"),
        "tenant_id": payload.get("tenant_id")
    }


def require_role(role: List[str]):
    """
    Dependency to ensure the user has the required role.
    """
    def role_checker(user: dict = Depends(get_current_user)):
        if user["role"] not in role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for this user role",
            )
        return user

    return role_checker