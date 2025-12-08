from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class InvitationBase(BaseModel):
    receiver_id: UUID
    invitation_type: str = "team_invite"


class InvitationCreate(InvitationBase):
    team_id: UUID


class InvitationResponse(InvitationBase):
    id: UUID
    team_id: UUID
    sender_id: UUID
    status: str 
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InvitationUpdate(BaseModel):
    status: str 

