# app/middleware/auth_middleware.py
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.status import HTTP_401_UNAUTHORIZED
from jose import jwt, JWTError 
from app.utils.tokens import SECRET_KEY, ALGORITHM

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path.rstrip("/")
        unauthenticated_paths = ["/auth/login", "/auth/refresh"]

        # Allow M-Pesa callback with or without API gateway prefixes.
        # Examples:
        # /sales/mpesa/callback
        # /api/sales/mpesa/callback
        # /api/v1/sales/mpesa/callback
        is_mpesa_callback = path.endswith("/sales/mpesa/callback")

        if is_mpesa_callback or any(path.startswith(p) for p in unauthenticated_paths):
            print(f"DEBUG: Unauthenticated path accessed: '{path}' - allowing without auth")
            return await call_next(request)

        print(f"DEBUG: Authenticating request for path: '{path}'")
        authorization: str = request.headers.get("Authorization")

        if not authorization or not authorization.startswith("Bearer "):
            return JSONResponse(
                {"detail": "Authorization header missing or invalid"},
                status_code=HTTP_401_UNAUTHORIZED
            )
        
        token = authorization.split(" ", 1)[1]
        
        try:
            # Here we are using jose's decode method directly
            print(f"DEBUG: ACCESS_SECRET_KEY used to decode: '{SECRET_KEY}'")
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            request.state.user = payload
        
        except JWTError as e:
            return JSONResponse(
                {"detail": f"Invalid or expired token: {e}"},
                status_code=HTTP_401_UNAUTHORIZED
            )
        
        return await call_next(request)
