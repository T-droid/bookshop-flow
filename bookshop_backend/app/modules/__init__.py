from fastapi import APIRouter
from .tenants.tenants_controller import router as tenant_router
from .auth.auth_controller import router as auth_router
from .onboarding.onboarding_controller import router as onboarding_router
from .books.book_controller import router as book_router
from .suppliers.supplier_controller import router as supplier_router
from .tax.tax_controller import router as tax_router
from .purchase_orders.purchase_order_controller import router as purchase_order_router
from .inventory.inventory_controller import router as inventory_router
from .sales.sales_controller import router as sales_router
from .payments.payment_controller import router as payment_router


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

api_router.include_router(
    supplier_router,
    prefix="/suppliers",
    tags=["Suppliers"],
    responses={404: {"description": "Not found"}},
)

api_router.include_router(
    tax_router,
    prefix="/taxes",
    tags=["Taxes"],
    responses={404: {"description": "Not found"}},
)

api_router.include_router(
    purchase_order_router,
    prefix="/purchase-orders",
    tags=["Purchase Orders"],
    responses={404: {"description": "Not found"}},
)

api_router.include_router(
    inventory_router,
    prefix="/inventory",
    tags=["Inventory"],
    responses={404: {"description": "Not found"}},
)


api_router.include_router(
    sales_router,
    tags=["Sales"],
    prefix="/sales",
    responses={404: {"description": "Not found"}},
)

api_router.include_router(
    payment_router,
    prefix="/payments",
    tags=["Payments"],
    responses={404: {"description": "Not found"}},
)
