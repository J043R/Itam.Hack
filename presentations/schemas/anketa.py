from __future__ import annotations
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from uuid import UUID
from pydantic import BaseModel
import presentations.schemas.user

class AnketaBase(BaseModel):
    name: str
    last_name: str
    role: str
    contacts: str
    skills: Optional[str] = None
    experience: Optional[str] = None
    bio: Optional[str] = None


class AnketaCreate(AnketaBase):
    pass


class AnketaUpdate(BaseModel):
    name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    contacts: Optional[str] = None
    skills: Optional[str] = None
    experience: Optional[str] = None
    bio: Optional[str] = None


class AnketaResponse(AnketaBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnketaWithUser(AnketaResponse):
    user: Optional["presentations.schemas.user.UserResponse"] = None
