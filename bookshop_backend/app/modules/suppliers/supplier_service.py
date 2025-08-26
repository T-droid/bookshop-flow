from ...db.session import SessionDep
from .supplier_model import SupplierCreate
from .supplier_repository import SupplierRepository
from ...utils.result import ServiceResult


class SupplierService:
    def __init__(self, db: SessionDep):
        self.repo = SupplierRepository(db)

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