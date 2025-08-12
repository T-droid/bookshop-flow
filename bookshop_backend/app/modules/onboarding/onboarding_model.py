from pydantic import BaseModel
from ..user.user_model import UserCreate
from ..tenants.tenants_model import TenantCreate

class TenantCreate(BaseModel):
    tenant: TenantCreate
    admin: UserCreate

    class Config:
        json_schema_extra = {
            "example": {
                "tenant": {
                    "name": "The Literary Corner",
                    "email": "tenant@example.com"
                },
                "admin": {
                    "email": "admin@example.com",
                    "full_name": "Admin User",
                    "phone_number": "+1234567890",
                    "password": "securepassword",
                    "user_role": "admin"
                }
            }
        }
