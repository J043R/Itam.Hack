from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from collections import Counter

from presentations.api.v1.dependencies import get_db, get_current_admin
from presentations.schemas.analytics import HackathonStats, TeamComposition, AnalyticsResponse, RoleStats
from persistent.db.models import Administrator, Hackathon, Team, TeamMember, HackathonRegistration, UserAnketa
from repositories.hackathon_repository import HackathonRepository
from repositories.team_repository import TeamRepository

router = APIRouter()


@router.get("/hackathon/{hackathon_id}", response_model=AnalyticsResponse)
async def get_hackathon_analytics(
    hackathon_id: UUID,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Получить аналитику по хакатону (только по активным командам)"""
    hackathon_repo = HackathonRepository(db)
    team_repo = TeamRepository(db)
    
    hackathon = await hackathon_repo.get_by_id(hackathon_id)
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )
    
    # Подсчитываем АКТИВНЫЕ команды
    teams_result = await db.execute(
        select(func.count(Team.id))
        .where(Team.id_hackathon == hackathon_id)
        .where(Team.is_active == True)
    )
    total_teams = teams_result.scalar_one() or 0
    
    # Подсчитываем всех зарегистрированных на хакатон
    registered_result = await db.execute(
        select(func.count(HackathonRegistration.user_id))
        .where(HackathonRegistration.hackathon_id == hackathon_id)
    )
    total_registered = registered_result.scalar_one() or 0
    
    # Подсчитываем уникальных участников в АКТИВНЫХ командах
    members_result = await db.execute(
        select(func.count(func.distinct(TeamMember.user_id)))
        .join(Team)
        .where(Team.id_hackathon == hackathon_id)
        .where(Team.is_active == True)
    )
    participants_in_teams = members_result.scalar_one() or 0
    
    # Участники без команды = зарегистрированные - в активных командах
    participants_without_team = total_registered - participants_in_teams
    
    team_formation_percentage = (
        (participants_in_teams / total_registered * 100)
        if total_registered > 0 else 0
    )
    
    # Статистика по ролям всех зарегистрированных участников
    # Группируем по нормализованной роли (lowercase, trim)
    roles_result = await db.execute(
        select(func.lower(func.trim(UserAnketa.role)), func.count(UserAnketa.role))
        .join(HackathonRegistration, HackathonRegistration.user_id == UserAnketa.user_id)
        .where(HackathonRegistration.hackathon_id == hackathon_id)
        .group_by(func.lower(func.trim(UserAnketa.role)))
    )
    roles_data = roles_result.all()
    
    # Нормализуем названия ролей (первая буква заглавная)
    roles_stats = [
        RoleStats(
            role=(role.strip().capitalize() if role else "Не указана"),
            count=count
        )
        for role, count in roles_data
    ]
    # Сортируем по количеству (убывание)
    roles_stats.sort(key=lambda x: x.count, reverse=True)
    
    stats = HackathonStats(
        hackathon_id=hackathon.id,
        hackathon_name=hackathon.name,
        total_registered=total_registered,
        total_participants_in_teams=participants_in_teams,
        total_teams=total_teams,
        participants_without_team=participants_without_team,
        team_formation_percentage=round(team_formation_percentage, 2),
        roles_stats=roles_stats
    )
    
    # Получаем состав АКТИВНЫХ команд
    teams = await team_repo.get_by_hackathon(hackathon_id)
    team_compositions = []
    
    for team in teams:
        # Пропускаем неактивные команды
        if not team.is_active:
            continue
            
        members_names = []
        captain_name = ""
        
        for member in team.members:
            member_name = f"{member.user.first_name} {member.user.last_name or ''}".strip()
            members_names.append(member_name)
            
            # Определяем имя капитана
            if member.user_id == team.id_capitan:
                captain_name = member_name
        
        team_compositions.append(
            TeamComposition(
                team_id=team.id,
                team_name=team.name,
                hackathon_name=hackathon.name,
                captain_name=captain_name,
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

