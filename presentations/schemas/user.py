from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    telegram_id: str
    telegram_user_name: Optional[str] = None
    first_name: str
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    telegram_hash: str


class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class TelegramAuthRequest(BaseModel):
    init_data: str


class TelegramAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class CodeLoginRequest(BaseModel):
    code: str


class CodeLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    has_anketa: bool = False
