from fastapi import APIRouter
from .sales.sales_controller import router as sales_router
from .payments.payment_controller import router as payment_router

api_router = APIRouter()

api_router.include_router(
    sales_router,
    prefix="/sales",
    responses={404: {"description": "Not found"}},
)

api_router.include_router(
    payment_router,
    prefix="/payments",
    responses={404: {"description": "Not found"}},
)