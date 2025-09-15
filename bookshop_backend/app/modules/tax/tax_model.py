from pydantic import BaseModel, Field
from typing import Optional
import uuid
from datetime import datetime


class CreateTaxModel(BaseModel):
    taxName: str = Field(..., max_length=100, index=True, nullable=False)
    taxRate: float = Field(..., ge=0.0, le=1.0)  # Rate should be between 0 and 1
    description: Optional[str] = Field(default=None, max_length=500)
    isDefault: bool = Field(default=False, nullable=False)
    effectiveDate: datetime = Field(..., index=True)

    def __repr__(self):
        return f"TaxModel(id={self.id}, name={self.taxName}, rate={self.taxRate})"


class UpdateTaxModel(BaseModel):
    taxName: Optional[str] = Field(default=None, max_length=100, index=True)
    taxRate: Optional[float] = Field(default=None, ge=0.0, le=1.0)  # Rate should be between 0 and 1
    description: Optional[str] = Field(default=None, max_length=500)
    isDefault: Optional[bool] = Field(default=None)

    def __repr__(self):
        return f"UpdateTaxModel(name={self.taxName}, rate={self.taxRate})"

class TaxResponseModel(BaseModel):
    id: uuid.UUID
    taxName: str
    taxRate: float
    description: Optional[str]
    isDefault: bool
    effectiveDate: datetime

    class Config:
        from_attributes = True

    def __repr__(self):
        return f"TaxResponseModel(id={self.id}, name={self.taxName}, rate={self.taxRate})"