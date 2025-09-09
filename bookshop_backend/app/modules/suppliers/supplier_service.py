from ...db.session import SessionDep
from .supplier_model import SupplierCreate, SupplierDashboardResponse
from .supplier_repository import SupplierRepository
from ...utils.result import ServiceResult
from ..books.book_service import BookService


class SupplierService:
    def __init__(self, db: SessionDep):
        self.repo = SupplierRepository(db)
        self.book = BookService(db)

    async def create_supplier(self, supplier_data: SupplierCreate) -> ServiceResult:
        try:
            # Check if supplier already exists
            existing_supplier = await self.repo.get_supplier_by_name_and_email(
                name=supplier_data.name,
                contact_info=supplier_data.contact_info
            )
            if existing_supplier:
                if await self.repo.check_tenant_supplier_exists(supplier_data.tenant_id, existing_supplier.id):
                    return ServiceResult(success=False, error="Supplier already exists for this tenant")
                
                await self.repo.add_tenant_to_supplier(existing_supplier.id, supplier_data.tenant_id)
                return ServiceResult(success=True, data=existing_supplier)
            
            # Create new supplier
            supplier_id = await self.repo.create_supplier(supplier_data)
            await self.repo.add_tenant_to_supplier(supplier_id, supplier_data.tenant_id)
            return ServiceResult(success=True, data=supplier_id)
        except Exception as e:
            return ServiceResult(success=False, error=str(e))
        
    async def get_suppliers_by_tenant(self, tenant_id: str, skip: int = 0, limit: int = 100) -> ServiceResult:
        try:
            suppliers = await self.repo.list_suppliers(tenant_id, skip, limit)
            return ServiceResult(success=True, data=suppliers)
        except Exception as e:
            return ServiceResult(success=False, error=str(e))

    async def get_supplier_dashboard(self, tenant_id: str) -> ServiceResult:
        try:
            suppliers_data = await self.repo.list_suppliers(tenant_id)
            
            # Convert SQLModel objects to dictionaries for Pydantic validation
            suppliers_list = []
            for supplier in suppliers_data:
                supplier_dict = {
                    "id": str(supplier.id),
                    "name": supplier.name,
                    "contact_person": supplier.contact_person,
                    "contact_info": supplier.contact_info,
                    "phone_number": supplier.phone_number,
                    "address": supplier.address,
                    "status": supplier.status
                }
                suppliers_list.append(supplier_dict)
            
            dashboard_data = {
                "total_suppliers": len(suppliers_data),
                "total_active_suppliers": sum(1 for s in suppliers_data if s.status == "active"),
                "total_books": 0,  # Default value, will be updated below
                "supplier_list": suppliers_list
            }
            
            books_count_result = await self.book.get_total_books_count(tenant_id)
            if books_count_result.success:
                dashboard_data["total_books"] = books_count_result.data.get("total_books", 0)
            else:
                dashboard_data["total_books"] = 0
                
            validated_data = SupplierDashboardResponse.model_validate(dashboard_data)
            return ServiceResult(success=True, data=validated_data)
        except Exception as e:
            return ServiceResult(success=False, error=str(e))