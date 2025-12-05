from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from presentations.api.v1.dependencies import get_db, get_current_user
from presentations.schemas.team import TeamCreate, TeamUpdate, TeamResponse, TeamWithMembers
from persistent.db.models import User, Team, TeamMember
from repositories.team_repository import TeamRepository
from repositories.hackathon_repository import HackathonRepository
from repositories.anketa_repository import AnketaRepository

router = APIRouter()


@router.post("", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
async def create_team(
    team_data: TeamCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    team_repo = TeamRepository(db)
    hackathon_repo = HackathonRepository(db)
    anketa_repo = AnketaRepository(db)
    
    hackathon = await hackathon_repo.get_by_id(team_data.hackathon_id)
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )
    
    anketa = await anketa_repo.get_by_user_id(current_user.id)
    if not anketa:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must create an anketa first"
        )
    
    existing_team = await team_repo.get_by_user_and_hackathon(
        current_user.id, team_data.hackathon_id
    )
    if existing_team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already in a team for this hackathon"
        )
    
    team = Team(
        name=team_data.name,
        id_hackathon=team_data.hackathon_id,
        id_capitan=current_user.id,
        max_size=team_data.max_size,
        status=team_data.status,
        description=team_data.description
    )
    
    created_team = await team_repo.create(team)
    
    await team_repo.add_member(created_team.id, current_user.id)
    
    members_count = await team_repo.get_team_members_count(created_team.id)
    if members_count >= created_team.max_size:
        await team_repo.update(created_team.id, status="full")
    
    return TeamResponse.model_validate(created_team)


@router.get("/hackathon/{hackathon_id}", response_model=List[TeamResponse])
async def get_hackathon_teams(
    hackathon_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    team_repo = TeamRepository(db)
    teams = await team_repo.get_by_hackathon(hackathon_id, skip, limit)
    return [TeamResponse.model_validate(t) for t in teams]


@router.get("/my", response_model=List[TeamResponse])
async def get_my_teams(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return []


@router.get("/{team_id}", response_model=TeamWithMembers)
async def get_team(
    team_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    team_repo = TeamRepository(db)
    team = await team_repo.get_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    return TeamWithMembers.model_validate(team)

