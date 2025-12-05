from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: str
    permissions: str


class AdminCreate(AdminBase):
    password: str


class AdminResponse(AdminBase):
    id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

