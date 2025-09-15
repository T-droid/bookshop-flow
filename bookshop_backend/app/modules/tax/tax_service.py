from .tax_model import CreateTaxModel, UpdateTaxModel, TaxResponseModel
from .tax_repository import TaxRepository
from ...db.session import SessionDep
from ...utils.result import ServiceResult
import uuid


class TaxService:
    def __init__(self, db: SessionDep):
        self.repo = TaxRepository(db)

    async def create_tax_rate(self, tax_rate_data: CreateTaxModel, tenant_id: uuid.UUID) -> ServiceResult:
        try:
            existing_tax_rate = await self.repo.get_tax_rate_by_name(tax_rate_data.taxName.lower(), tenant_id)
            if existing_tax_rate:
                return ServiceResult(success=False, error="Tax rate with this name already exists")

            if tax_rate_data.isDefault:
                await self._unset_existing_default(tenant_id)

            tax_rate_data.taxName = tax_rate_data.taxName.lower()
            tax_rate = await self.repo.create_tax_rate(tax_rate_data, tenant_id)
            return ServiceResult(success=True, data=tax_rate.id)
        except Exception as e:
            return ServiceResult(success=False, error=str(e))
        
    async def update_tax_rate(self, tax_rate_id: uuid.UUID, tax_rate_data: UpdateTaxModel, tenant_id: uuid.UUID) -> ServiceResult:
        try:
            existing_tax_rate = await self.repo.get_tax_rate_by_id(tax_rate_id, tenant_id)
            if not existing_tax_rate:
                return ServiceResult(success=False, error="Tax rate not found")
            
            # Check name uniqueness if name is being updated
            if tax_rate_data.taxName:
                existing_tax_rate_by_name = await self.repo.get_tax_rate_by_name(tax_rate_data.taxName.lower(), tenant_id)
                if existing_tax_rate_by_name and existing_tax_rate_by_name.id != tax_rate_id:
                    return ServiceResult(success=False, error="Tax rate with this name already exists")
                existing_tax_rate.taxName = tax_rate_data.taxName.lower()

            # If this tax rate is being set as default, unset any existing default
            if tax_rate_data.isDefault:
                await self._unset_existing_default(tenant_id, exclude_id=tax_rate_id)
            
            # Update the tax rate fields
            for field, value in tax_rate_data.dict(exclude_unset=True).items():
                if field != 'taxName':
                    setattr(existing_tax_rate, field, value)
            
            await self.repo.save(existing_tax_rate)
            return ServiceResult(success=True, data=existing_tax_rate)
        except Exception as e:
            return ServiceResult(success=False, error=str(e))
    
    async def _unset_existing_default(self, tenant_id: uuid.UUID, exclude_id: uuid.UUID = None) -> None:
        """
        Private method to unset any existing default tax rate for a tenant
        """
        try:
            current_default = await self.repo.get_default_tax_rate(tenant_id)
            if current_default and (exclude_id is None or current_default.id != exclude_id):
                current_default.default = False
                await self.repo.save(current_default)
        except Exception as e:
            # Log the error but don't fail the main operation
            print(f"Warning: Failed to unset existing default tax rate: {str(e)}")
            raise e
    
    async def get_default_tax_rate(self, tenant_id: uuid.UUID) -> ServiceResult:
        """
        Get the default tax rate for a tenant
        """
        try:
            default_tax = await self.repo.get_default_tax_rate(tenant_id)
            if not default_tax:
                return ServiceResult(success=False, error="No default tax rate found")
            return ServiceResult(success=True, data=default_tax)
        except Exception as e:
            return ServiceResult(success=False, error=str(e))
        
    async def is_tax_name_unique(self, name: str, tenant_id: uuid.UUID) -> ServiceResult:
        """
        Check if a tax name is unique within the tenant
        """
        try:
            existing_tax_rate = await self.repo.get_tax_rate_by_name(name.lower(), tenant_id)
            is_unique = existing_tax_rate is None
            return ServiceResult(success=True, data=is_unique)
        except Exception as e:
            return ServiceResult(success=False, error=str(e))
    
    async def set_default_tax_rate(self, tax_rate_id: uuid.UUID, tenant_id: uuid.UUID) -> ServiceResult:
        """
        Set a specific tax rate as the default
        """
        try:
            tax_rate = await self.repo.get_tax_rate_by_id(tax_rate_id, tenant_id)
            if not tax_rate:
                return ServiceResult(success=False, error="Tax rate not found")
            
            # Unset any existing default
            await self._unset_existing_default(tenant_id, exclude_id=tax_rate_id)
            
            # Set this one as default
            tax_rate.default = True
            await self.repo.save(tax_rate)
            
            return ServiceResult(success=True, data=tax_rate)
        except Exception as e:
            return ServiceResult(success=False, error=str(e))

    async def get_tax_rates_by_tenant(self, tenant_id: uuid.UUID) -> ServiceResult:
        """
        Get all tax rates for a tenant
        """
        try:
            tax_rates = await self.repo.list_tax_rates_by_tenant(tenant_id)
            validated_tax_rates = [TaxResponseModel.model_validate(tr) for tr in tax_rates]
            return ServiceResult(success=True, data=validated_tax_rates)
        except Exception as e:
            return ServiceResult(success=False, error=str(e))