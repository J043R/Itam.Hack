from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel


class HackathonStats(BaseModel):
    hackathon_id: UUID
    hackathon_name: str
    total_participants: int
    total_teams: int
    participants_without_team: int
    team_formation_percentage: float


class TeamComposition(BaseModel):
    team_id: UUID
    team_name: str
    hackathon_name: str
    captain_name: str
    members_count: int
    max_size: int
    members: List[str]  # List of member names/IDs


class AnalyticsResponse(BaseModel):
    hackathon_stats: Optional[HackathonStats] = None
    team_compositions: List[TeamComposition] = []

