from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List
import uuid
from datetime import datetime as dt

class UserRoles(SQLModel, table=True):
    user_id: uuid.UUID = Field(foreign_key="user.id")
    role_id: uuid.UUID = Field(foreign_key="role.id")