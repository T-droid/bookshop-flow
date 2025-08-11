from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from jwt import exceptions as jwt_exceptions
from app.utils.tokens import decode_access_token

security = HTTPBearer()

def get_current_user(
    credentials = Depends(security)  
):
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        role = payload.get("role")
        if role not in ["superadmin", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action"
            )
        return payload
    except jwt_exceptions.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
