from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Email of the user")
    password: str = Field(..., min_length=8, description="Password of the user")


class SuperAdminResponse(BaseModel):
    id: str = Field(..., description="Unique identifier for the superadmin")
    name: str = Field(..., description="Name of the superadmin")
    email: EmailStr = Field(..., description="Email of the superadmin")
    is_active: bool = Field(..., description="Status indicating if the superadmin is active")
    role: str = Field(default="superadmin", description="Role of the user, default is 'superadmin'")

    class Config:
        orm_mode = True

class AdminLoginResponse(BaseModel):
    id: str = Field(..., description="Unique identifier for the admin")
    name: str = Field(..., description="Name of the admin")
    email: EmailStr = Field(..., description="Email of the admin")
    is_active: bool = Field(..., description="Status indicating if the admin is active")
    role: str = Field(default="admin", description="Role of the user, default is 'admin'")
    tenant_id: Optional[str] = Field(None, description="Tenant ID associated with the admin")
    last_login: Optional[str] = Field(None, description="Timestamp of the last login")

    class Config:
        orm_mode = True

class ManagerLoginResponse(BaseModel):
    id: str = Field(..., description="Unique identifier for the manager")
    name: str = Field(..., description="Name of the manager")
    email: EmailStr = Field(..., description="Email of the manager")
    is_active: bool = Field(..., description="Status indicating if the manager is active")
    role: str = Field(default="manager", description="Role of the user, default is 'manager'")
    tenant_id: Optional[str] = Field(None, description="Tenant ID associated with the manager")
    last_login: Optional[str] = Field(None, description="Timestamp of the last login")

    class Config:
        orm_mode = True