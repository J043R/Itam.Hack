from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel


class TeamBase(BaseModel):
    name: str
    description: Optional[str] = None
    max_size: int
    status: str = "open"


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
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    user_avatar: Optional[str] = None
    role: Optional[str] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_team_member(cls, member, anketa=None) -> "TeamMemberResponse":
        user = member.user
        # Приоритет: анкета > пользователь
        first_name = (anketa.name if anketa and anketa.name else None) or (user.first_name if user else None)
        last_name = (anketa.last_name if anketa and anketa.last_name else None) or (user.last_name if user else None)
        return cls(
            user_id=member.user_id,
            joined_at=member.joined_at,
            first_name=first_name,
            last_name=last_name,
            user_avatar=user.avatar_url if user else None,
            role=anketa.role if anketa else None
        )
    


class TeamSimpleResponse(BaseModel):
    id: UUID
    name: str
    id_hackathon: UUID
    hackathon_name: Optional[str] = None
    id_capitan: UUID
    max_size: int
    status: str
    description: Optional[str] = None
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class TeamResponse(TeamSimpleResponse):
    members: List[TeamMemberResponse] = []

    class Config:
        from_attributes = True

    @classmethod
    def from_team(cls, team) -> "TeamResponse":
        members = [TeamMemberResponse.from_team_member(m) for m in team.members] if team.members else []
        return cls(
            id=team.id,
            name=team.name,
            id_hackathon=team.id_hackathon,
            id_capitan=team.id_capitan,
            max_size=team.max_size,
            status=team.status,
            description=team.description,
            created_at=team.created_at,
            is_active=team.is_active,
            members=members
        )


class TeamWithMembers(TeamResponse):
    members: List[TeamMemberResponse]

    class Config:
        from_attributes = True

    @classmethod
    def from_team(cls, team) -> "TeamWithMembers":
        members = [TeamMemberResponse.from_team_member(m) for m in team.members] if team.members else []
        return cls(
            id=team.id,
            name=team.name,
            id_hackathon=team.id_hackathon,
            id_capitan=team.id_capitan,
            max_size=team.max_size,
            status=team.status,
            description=team.description,
            created_at=team.created_at,
            is_active=team.is_active,
            members=members
        )

