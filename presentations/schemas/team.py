from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel


class TeamBase(BaseModel):
    name: str
    description: Optional[str] = None
    max_size: int
    status: str = "open"  # open, closed, full


class TeamCreate(TeamBase):
    hackathon_id: UUID


class TeamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    max_size: Optional[int] = None
    status: Optional[str] = None


class TeamMemberResponse(BaseModel):
    user_id: UUID
    joined_at: datetime
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None

    class Config:
        from_attributes = True


class TeamResponse(TeamBase):
    id: UUID
    id_hackathon: UUID
    id_capitan: UUID
    created_at: datetime
    members: Optional[List[TeamMemberResponse]] = []

    class Config:
        from_attributes = True


class TeamWithMembers(TeamResponse):
    members: List[TeamMemberResponse]

    class Config:
        from_attributes = True

