from fastapi import APIRouter
from .tenants.tenants_controller import router as tenant_router
from .auth.auth_controller import router as auth_router
from .onboarding.onboarding_controller import router as onboarding_router
from .books.book_controller import router as book_router


api_router = APIRouter()

api_router.include_router(
    tenant_router,
    prefix="/tenants",
    tags=["Tenants"],
    responses={404: {"description": "Not found"}},
)

api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["Auth"],
    responses={404: {"description": "Not found"}},
)

api_router.include_router(
    onboarding_router,
    prefix="/onboarding",
    tags=["Onboarding"],
    responses={404: {"description": "Not found"}},
)

api_router.include_router(
    book_router,
    prefix="/books",
    tags=["Books"],
    responses={404: {"description": "Not found"}},
)