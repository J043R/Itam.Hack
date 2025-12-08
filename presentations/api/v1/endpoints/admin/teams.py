from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from presentations.api.v1.dependencies import get_db, get_current_admin
from presentations.schemas.team import TeamResponse
from persistent.db.models import Administrator
from repositories.team_repository import TeamRepository
from repositories.hackathon_repository import HackathonRepository
from repositories.anketa_repository import AnketaRepository

router = APIRouter()


@router.get("", response_model=List[TeamResponse])
async def get_all_teams(
    skip: int = 0,
    limit: int = 100,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить все активные команды (для админов).
    """
    team_repo = TeamRepository(db)
    anketa_repo = AnketaRepository(db)
    
    teams = await team_repo.get_all(skip=skip, limit=limit)
    active_teams = [t for t in teams if t.is_active]
    
    hackathon_repo = HackathonRepository(db)
    
    result = []
    for team in active_teams:
        # Загружаем участников с анкетами
        from presentations.schemas.team import TeamMemberResponse
        members_response = []
        for member in team.members:
            anketa = await anketa_repo.get_by_user_id(member.user_id)
            members_response.append(TeamMemberResponse.from_team_member(member, anketa))
        
        # Получаем название хакатона
        hackathon_name = None
        if team.id_hackathon:
            hackathon = await hackathon_repo.get_by_id(team.id_hackathon)
            hackathon_name = hackathon.name if hackathon else None
        
        result.append(TeamResponse(
            id=team.id,
            name=team.name,
            id_hackathon=team.id_hackathon,
            hackathon_name=hackathon_name,
            id_capitan=team.id_capitan,
            max_size=team.max_size,
            status=team.status,
            description=team.description,
            created_at=team.created_at,
            is_active=team.is_active,
            members=members_response
        ))
    
    return result


@router.get("/hackathon/{hackathon_id}", response_model=List[TeamResponse])
async def get_hackathon_teams(
    hackathon_id: UUID,
    skip: int = 0,
    limit: int = 100,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить все команды конкретного хакатона (для админов).
    """
    team_repo = TeamRepository(db)
    hackathon_repo = HackathonRepository(db)
    anketa_repo = AnketaRepository(db)
    
    # Проверяем существование хакатона
    hackathon = await hackathon_repo.get_by_id(hackathon_id)
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Хакатон не найден"
        )
    
    teams = await team_repo.get_by_hackathon(hackathon_id, skip, limit)
    active_teams = [t for t in teams if t.is_active]
    
    result = []
    for team in active_teams:
        from presentations.schemas.team import TeamMemberResponse
        members_response = []
        for member in team.members:
            anketa = await anketa_repo.get_by_user_id(member.user_id)
            members_response.append(TeamMemberResponse.from_team_member(member, anketa))
        
        result.append(TeamResponse(
            id=team.id,
            name=team.name,
            id_hackathon=team.id_hackathon,
            id_capitan=team.id_capitan,
            max_size=team.max_size,
            status=team.status,
            description=team.description,
            created_at=team.created_at,
            is_active=team.is_active,
            members=members_response
        ))
    
    return result
