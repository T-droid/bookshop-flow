import uuid
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    phone_number: str = Field(..., min_length=1, max_length=15)
    full_name: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)
    user_role: Optional[str] = Field(default="manager")
    tenant_id: Optional[uuid.UUID] = None

    @validator("full_name", "phone_number", "password", pre=True)
    def strip_required_strings(cls, value: str) -> str:
        cleaned_value = value.strip()
        if not cleaned_value:
            raise ValueError("Field cannot be empty")
        return cleaned_value

    @validator("user_role", pre=True, always=True)
    def normalize_role(cls, value: Optional[str]) -> str:
        allowed_roles = {"admin", "manager", "cashier", "viewer", "editor"}
        normalized_value = (value or "manager").strip().lower()
        if normalized_value not in allowed_roles:
            raise ValueError("Role must be one of: admin, manager, cashier, viewer, editor")
        return normalized_value


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    phone_number: str
    full_name: Optional[str] = None
    user_role: str
    tenant_id: uuid.UUID

    class Config:
        from_attributes = True


class ResetUserPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=8, max_length=128)

    @validator("new_password", pre=True)
    def strip_password(cls, value: str) -> str:
        cleaned_value = value.strip()
        if not cleaned_value:
            raise ValueError("Password cannot be empty")
        return cleaned_value
