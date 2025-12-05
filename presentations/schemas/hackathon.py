from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class HackathonBase(BaseModel):
    name: str
    describe: Optional[str] = None
    date_starts: datetime
    date_end: datetime
    register_start: datetime
    register_end: datetime


class HackathonCreate(HackathonBase):
    pass


class HackathonUpdate(BaseModel):
    name: Optional[str] = None
    describe: Optional[str] = None
    date_starts: Optional[datetime] = None
    date_end: Optional[datetime] = None
    register_start: Optional[datetime] = None
    register_end: Optional[datetime] = None


class HackathonResponse(HackathonBase):
    id: UUID
    created_at: datetime
    created_by: Optional[UUID] = None

    class Config:
        from_attributes = True

