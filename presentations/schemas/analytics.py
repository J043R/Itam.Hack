from typing import List, Optional, Dict
from uuid import UUID
from pydantic import BaseModel


class RoleStats(BaseModel):
    role: str
    count: int


class HackathonStats(BaseModel):
    hackathon_id: UUID
    hackathon_name: str
    total_registered: int 
    total_participants_in_teams: int  
    total_teams: int 
    participants_without_team: int  
    team_formation_percentage: float  
    roles_stats: List[RoleStats] = []  


class TeamComposition(BaseModel):
    team_id: UUID
    team_name: str
    hackathon_name: str
    captain_name: str
    members_count: int
    max_size: int
    members: List[str]  


class AnalyticsResponse(BaseModel):
    hackathon_stats: Optional[HackathonStats] = None
    team_compositions: List[TeamComposition] = []

