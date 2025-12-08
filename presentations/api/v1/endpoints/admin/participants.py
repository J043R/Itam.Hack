from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import traceback

from presentations.api.v1.dependencies import get_db, get_current_admin
from presentations.schemas.anketa import AnketaWithUser
from presentations.schemas.profile import ProfileResponse, AchievementResponse
from persistent.db.models import Administrator, UserAnketa, Team, TeamMember, UserAchievement
from repositories.anketa_repository import AnketaRepository
from repositories.team_repository import TeamRepository
from repositories.user_repository import UserRepository
from repositories.hackathon_repository import HackathonRepository
from repositories.hackathon_registration_repository import HackathonRegistrationRepository
from datetime import datetime, timezone
import logging
from pydantic import BaseModel

# Создаем логгер для текущего модуля
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=List[AnketaWithUser])
async def get_all_participants(
    skip: int = 0,
    limit: int = 100,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить всех участников всех активных хакатонов.
    """
    anketa_repo = AnketaRepository(db)
    user_repo = UserRepository(db)
    registration_repo = HackathonRegistrationRepository(db)
    hackathon_repo = HackathonRepository(db)
    
    # Получаем все активные хакатоны (где регистрация ещё не закончилась)
    now = datetime.utcnow()
    all_hackathons = await hackathon_repo.get_all(skip=0, limit=1000)
    
    # Собираем уникальных пользователей со всех хакатонов
    all_user_ids = set()
    for hackathon in all_hackathons:
        registrations = await registration_repo.get_by_hackathon(hackathon.id)
        for reg in registrations:
            all_user_ids.add(reg.user_id)
    
    result = []
    for user_id in all_user_ids:
        anketa = await anketa_repo.get_by_user_id(user_id)
        if not anketa:
            continue
        
        user = await user_repo.get_by_id(user_id)
        if user and user.is_active:
            anketa.user = user
            result.append(AnketaWithUser.model_validate(anketa))
    
    # Пагинация
    return result[skip:skip + limit]


@router.get("/hackathon/{hackathon_id}", response_model=List[AnketaWithUser])
async def get_hackathon_participants(
    hackathon_id: UUID,
    skip: int = 0,
    limit: int = 100,
    role: str = None,
    team_status: str = None,  # "in_team", "without_team", None (все)
    skills: str = None,  # поиск по стеку/навыкам
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить участников хакатона с фильтрацией.
    
    Параметры фильтрации:
    - role: фильтр по роли (регистронезависимый)
    - team_status: "in_team" - только в командах, "without_team" - без команды
    - skills: поиск по навыкам/стеку (частичное совпадение)
    """
    team_repo = TeamRepository(db)
    anketa_repo = AnketaRepository(db)
    user_repo = UserRepository(db)
    registration_repo = HackathonRegistrationRepository(db)
    
    # Получаем всех зарегистрированных на хакатон
    registrations = await registration_repo.get_by_hackathon(hackathon_id)
    registered_user_ids = {r.user_id for r in registrations}
    
    if not registered_user_ids:
        return []
    
    # Получаем активные команды и их участников
    teams = await team_repo.get_by_hackathon(hackathon_id, skip=0, limit=1000)
    active_teams = [t for t in teams if t.is_active]
    
    users_in_teams = set()
    for team in active_teams:
        for member in team.members:
            users_in_teams.add(member.user_id)
    
    # Фильтруем по статусу команды
    if team_status == "in_team":
        target_user_ids = registered_user_ids & users_in_teams
    elif team_status == "without_team":
        target_user_ids = registered_user_ids - users_in_teams
    else:
        target_user_ids = registered_user_ids
    
    result = []
    
    for user_id in target_user_ids:
        anketa = await anketa_repo.get_by_user_id(user_id)
        if not anketa:
            continue
        
        # Фильтр по роли (регистронезависимый)
        if role:
            anketa_role = (anketa.role or "").lower().strip()
            if anketa_role != role.lower().strip():
                continue
        
        # Фильтр по навыкам/стеку
        if skills:
            anketa_skills = (anketa.skills or "").lower()
            if skills.lower() not in anketa_skills:
                continue
        
        user = await user_repo.get_by_id(user_id)
        if user and user.is_active:
            anketa.user = user
            result.append(AnketaWithUser.model_validate(anketa))
    
    # Пагинация
    return result[skip:skip + limit]


@router.get("/hackathon/{hackathon_id}/without-team", response_model=List[AnketaWithUser])
async def get_participants_without_team(
    hackathon_id: UUID,
    skip: int = 0,
    limit: int = 100,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить список участников без команды для конкретного хакатона.
    Возвращает только пользователей, которые ЗАРЕГИСТРИРОВАНЫ на этот хакатон, но не состоят в команде.
    """
    hackathon_repo = HackathonRepository(db)
    team_repo = TeamRepository(db)
    anketa_repo = AnketaRepository(db)
    user_repo = UserRepository(db)
    registration_repo = HackathonRegistrationRepository(db)
    
    # Проверяем существование хакатона
    hackathon = await hackathon_repo.get_by_id(hackathon_id)
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Хакатон не найден"
        )
    
    # Получаем всех зарегистрированных на хакатон
    registrations = await registration_repo.get_by_hackathon(hackathon_id)
    registered_user_ids = {r.user_id for r in registrations}
    
    if not registered_user_ids:
        return []
    
    # Получаем все команды хакатона
    all_teams = await team_repo.get_by_hackathon(hackathon_id, skip=0, limit=1000)
    active_teams = [t for t in all_teams if t.is_active]
    
    # Собираем ID всех пользователей, которые уже в командах
    users_in_teams = set()
    for team in active_teams:
        members = await team_repo.get_team_members(team.id)
        for member in members:
            users_in_teams.add(member.user_id)
    
    # Находим зарегистрированных пользователей без команды
    users_without_team = []
    for user_id in registered_user_ids:
        if user_id in users_in_teams:
            continue  # Уже в команде
        
        anketa = await anketa_repo.get_by_user_id(user_id)
        if not anketa:
            continue  # Нет анкеты
        
        user = await user_repo.get_by_id(user_id)
        if user and user.is_active:
            anketa.user = user
            users_without_team.append(AnketaWithUser.model_validate(anketa))
    
    # Применяем пагинацию
    paginated_results = users_without_team[skip:skip+limit]
    
    return paginated_results


@router.post("/hackathon/{hackathon_id}/team/{team_id}/add-user/{user_id}", status_code=status.HTTP_200_OK)
async def add_user_to_team(
    hackathon_id: UUID,
    team_id: UUID,
    user_id: UUID,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Добавить участника без команды в команду (только для администраторов).
    """
    hackathon_repo = HackathonRepository(db)
    team_repo = TeamRepository(db)
    user_repo = UserRepository(db)
    anketa_repo = AnketaRepository(db)
    
    # Проверяем существование хакатона
    hackathon = await hackathon_repo.get_by_id(hackathon_id)
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Хакатон не найден"
        )
    
    # Проверяем существование команды
    team = await team_repo.get_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Команда не найдена"
        )
    
    # Проверяем, что команда принадлежит этому хакатону
    if team.id_hackathon != hackathon_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Команда не принадлежит этому хакатону"
        )
    
    # Проверяем, что команда активна
    if not team.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Команда неактивна"
        )
    
    # Проверяем существование пользователя
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    # Проверяем, что у пользователя есть анкета
    anketa = await anketa_repo.get_by_user_id(user_id)
    if not anketa:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="У пользователя нет анкеты"
        )
    
    # Проверяем регистрацию пользователя на хакатон
    registration_repo = HackathonRegistrationRepository(db)
    registration = await registration_repo.get_by_user_and_hackathon(user_id, hackathon_id)
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь не зарегистрирован на этот хакатон"
        )
    
    # Проверяем, что пользователь не состоит уже в команде этого хакатона
    existing_team = await team_repo.get_by_user_and_hackathon(user_id, hackathon_id)
    if existing_team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Пользователь уже состоит в команде '{existing_team.name}'"
        )
    
    # Проверяем, что в команде есть свободные места
    current_members = await team_repo.get_team_members_count(team_id)
    if current_members >= team.max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Команда уже заполнена (максимум {team.max_size} участников)"
        )
    
    # Проверяем, не состоит ли пользователь уже в этой команде
    is_member = await team_repo.is_user_in_team(team_id, user_id)
    if is_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь уже состоит в этой команде"
        )
    
    user_name = f"{user.first_name} {user.last_name or ''}".strip()
    team_name = team.name
    team_max_size = team.max_size 
    # Добавляем пользователя в команду
    try:
        from persistent.db.models import TeamMember
        from datetime import datetime
        
        # 1. Создаем объект без joined_at
        team_member = TeamMember(
            team_id=team_id,
            user_id=user_id
        )
        
        # 2. Вручную устанавливаем время
        team_member.joined_at = datetime.utcnow()
        
    # 3. Добавляем в сессию
        db.add(team_member)
        await db.commit()
        #await db.refresh(team_member)
        
        # Получаем обновленное количество участников
        updated_members_count = await team_repo.get_team_members_count(team_id)
        
        
        return {
            "message": f"Пользователь {user_name} успешно добавлен в команду '{team_name}'",
            "user_id": str(user_id),
            "user_name": user_name,
            "team_id": str(team_id),
            "team_name": team_name,
            "current_members": updated_members_count,
            "max_size": team_max_size
        }
    except Exception as e:
        await db.rollback()
        error_details = traceback.format_exc()
        logger.error(f"Ошибка добавления: {error_details}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при добавлении пользователя в команду: {str(e)}"
        )


# Схема для команды с датой регистрации
class TeamWithRegistrationDate(BaseModel):
    id: UUID
    name: str
    hackathon_id: Optional[UUID] = None
    hackathon_name: Optional[str] = None
    registration_date: Optional[str] = None
    
    class Config:
        from_attributes = True


@router.get("/{user_id}", response_model=ProfileResponse)
async def get_participant_profile(
    user_id: UUID,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить профиль участника по ID (для админов).
    """
    user_repo = UserRepository(db)
    anketa_repo = AnketaRepository(db)
    
    # Получаем пользователя
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    # Получаем анкету пользователя
    anketa = await anketa_repo.get_by_user_id(user_id)
    
    # Получаем достижения пользователя
    result = await db.execute(
        select(UserAchievement)
        .where(UserAchievement.user_id == user_id)
        .options(selectinload(UserAchievement.hackathon))
    )
    achievements = result.scalars().all()
    
    # Формируем список достижений
    achievements_list = []
    for achievement in achievements:
        achievements_list.append(AchievementResponse(
            hackathon_id=achievement.hackathon_id,
            hackathon_name=achievement.hackathon.name,
            result=achievement.result,
            role=achievement.role,
            date=achievement.hackathon.date_end
        ))
    
    return ProfileResponse(
        user_id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        avatar_url=user.avatar_url,
        role=anketa.role if anketa else None,
        university=anketa.university if anketa else None,
        bio=anketa.bio if anketa else None,
        achievements=achievements_list
    )


@router.get("/{user_id}/achievements", response_model=List[AchievementResponse])
async def get_participant_achievements(
    user_id: UUID,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить достижения участника по ID (для админов).
    """
    user_repo = UserRepository(db)
    
    # Проверяем существование пользователя
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    result = await db.execute(
        select(UserAchievement)
        .where(UserAchievement.user_id == user_id)
        .options(selectinload(UserAchievement.hackathon))
    )
    achievements = result.scalars().all()
    
    achievements_list = []
    for achievement in achievements:
        achievements_list.append(AchievementResponse(
            hackathon_id=achievement.hackathon_id,
            hackathon_name=achievement.hackathon.name,
            result=achievement.result,
            role=achievement.role,
            date=achievement.hackathon.date_end
        ))
    
    return achievements_list


@router.get("/{user_id}/teams", response_model=List[TeamWithRegistrationDate])
async def get_participant_teams(
    user_id: UUID,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить команды участника по ID (для админов).
    """
    user_repo = UserRepository(db)
    team_repo = TeamRepository(db)
    hackathon_repo = HackathonRepository(db)
    
    # Проверяем существование пользователя
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    # Получаем все команды пользователя через TeamMember
    result = await db.execute(
        select(TeamMember)
        .where(TeamMember.user_id == user_id)
        .options(selectinload(TeamMember.team))
    )
    team_members = result.scalars().all()
    
    teams_list = []
    for tm in team_members:
        team = tm.team
        if team and team.is_active:
            # Получаем информацию о хакатоне
            hackathon = await hackathon_repo.get_by_id(team.id_hackathon) if team.id_hackathon else None
            
            teams_list.append(TeamWithRegistrationDate(
                id=team.id,
                name=team.name,
                hackathon_id=team.id_hackathon,
                hackathon_name=hackathon.name if hackathon else None,
                registration_date=tm.joined_at.strftime("%d.%m.%Y") if tm.joined_at else None
            ))
    
    return teams_list
