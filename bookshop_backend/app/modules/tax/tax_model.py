from pydantic import BaseModel, Field
from typing import Optional
import uuid
from datetime import datetime


class CreateTaxModel(BaseModel):
    name: str = Field(..., max_length=100, index=True, nullable=False)
    rate: float = Field(..., ge=0.0, le=1.0)  # Rate should be between 0 and 1
    description: Optional[str] = Field(default=None, max_length=500)
    default: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, index=True)

    def __repr__(self):
        return f"TaxModel(id={self.id}, name={self.name}, rate={self.rate})"
    

class UpdateTaxModel(BaseModel):
    name: Optional[str] = Field(default=None, max_length=100, index=True)
    rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)  # Rate should be between 0 and 1
    description: Optional[str] = Field(default=None, max_length=500)
    default: Optional[bool] = Field(default=None)

    def __repr__(self):
        return f"UpdateTaxModel(name={self.name}, rate={self.rate})"