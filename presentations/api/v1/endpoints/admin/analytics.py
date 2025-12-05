from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from presentations.api.v1.dependencies import get_db, get_current_admin
from presentations.schemas.analytics import HackathonStats, TeamComposition, AnalyticsResponse
from persistent.db.models import Administrator, Hackathon, Team, TeamMember
from repositories.hackathon_repository import HackathonRepository
from repositories.team_repository import TeamRepository

router = APIRouter()


@router.get("/hackathon/{hackathon_id}", response_model=AnalyticsResponse)
async def get_hackathon_analytics(
    hackathon_id: UUID,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Получить аналитику по хакатону"""
    hackathon_repo = HackathonRepository(db)
    team_repo = TeamRepository(db)
    
    hackathon = await hackathon_repo.get_by_id(hackathon_id)
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )
    
    # Подсчитываем команды
    teams_result = await db.execute(
        select(func.count(Team.id))
        .where(Team.id_hackathon == hackathon_id)
    )
    total_teams = teams_result.scalar_one() or 0
    
    # Подсчитываем уникальных участников в командах (участники = пользователи в командах)
    members_result = await db.execute(
        select(func.count(func.distinct(TeamMember.user_id)))
        .join(Team)
        .where(Team.id_hackathon == hackathon_id)
    )
    total_participants = members_result.scalar_one() or 0
    participants_in_teams = total_participants
    participants_without_team = 0  # Все участники в командах, так как регистрация через команды
    
    team_formation_percentage = (
        (participants_in_teams / total_participants * 100)
        if total_participants > 0 else 0
    )
    
    stats = HackathonStats(
        hackathon_id=hackathon.id,
        hackathon_name=hackathon.name,
        total_participants=total_participants,
        total_teams=total_teams,
        participants_without_team=participants_without_team,
        team_formation_percentage=round(team_formation_percentage, 2)
    )
    
    # Получаем состав команд
    teams = await team_repo.get_by_hackathon(hackathon_id)
    team_compositions = []
    
    for team in teams:
        members_names = []
        for member in team.members:
            members_names.append(f"{member.user.first_name} {member.user.last_name or ''}")
        
        team_compositions.append(
            TeamComposition(
                team_id=team.id,
                team_name=team.name,
                hackathon_name=hackathon.name,
                captain_name="",  # Можно получить через join
                members_count=len(team.members),
                max_size=team.max_size,
                members=members_names
            )
        )
    
    return AnalyticsResponse(
        hackathon_stats=stats,
        team_compositions=team_compositions
    )


@router.get("/hackathon/{hackathon_id}/export")
async def export_hackathon_data(
    hackathon_id: UUID,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Экспорт данных хакатона в CSV"""
    # Реализация экспорта CSV
    # Пока заглушка
    return {"message": "CSV export not implemented yet"}

