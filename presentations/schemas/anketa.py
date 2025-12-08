from __future__ import annotations
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from uuid import UUID
from pydantic import BaseModel, Field
import presentations.schemas.user


class AnketaBase(BaseModel):
    name: str = Field(alias="firstName", validation_alias="firstName")
    last_name: str = Field(alias="lastName", validation_alias="lastName")
    role: str
    contacts: str
    university: Optional[str] = None
    skills: Optional[str] = None
    experience: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        populate_by_name = True 


class AnketaCreate(AnketaBase):
    pass


class AnketaUpdate(BaseModel):
    name: Optional[str] = Field(default=None, alias="firstName", validation_alias="firstName")
    last_name: Optional[str] = Field(default=None, alias="lastName", validation_alias="lastName")
    role: Optional[str] = None
    contacts: Optional[str] = None
    university: Optional[str] = None
    skills: Optional[str] = None
    experience: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        populate_by_name = True


class AnketaResponse(AnketaBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnketaWithUser(AnketaResponse):
    user: Optional["presentations.schemas.user.UserResponse"] = None
