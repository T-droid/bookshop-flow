from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    email: str
    phone_number: str
    full_name: str
    password: str
    user_role: Optional[str] = "manager"
    tenant_id: Optional[str] = None