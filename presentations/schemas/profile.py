from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class AchievementResponse(BaseModel):
    hackathon_id: UUID
    hackathon_name: str
    result: str
    role: str
    date: Optional[datetime]

    class Config:
        from_attributes = True


class ProfileResponse(BaseModel):
    user_id: UUID
    first_name: str  
    last_name: Optional[str]
    avatar_url: Optional[str]
    role: Optional[str]
    university: Optional[str]
    bio: Optional[str]
    achievements: List[AchievementResponse]

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    university: Optional[str] = None
    bio: Optional[str] = None
