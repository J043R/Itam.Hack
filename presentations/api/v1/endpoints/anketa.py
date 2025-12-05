from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from presentations.api.v1.dependencies import get_db, get_current_user
from presentations.schemas.anketa import AnketaCreate, AnketaUpdate, AnketaResponse, AnketaWithUser
from persistent.db.models import User, UserAnketa
from repositories.anketa_repository import AnketaRepository

from sqlalchemy import select, distinct
from persistent.db.models import Team, TeamMember
from repositories.team_repository import TeamRepository

router = APIRouter()


@router.post("", response_model=AnketaResponse, status_code=status.HTTP_201_CREATED)
async def create_anketa(
    anketa_data: AnketaCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Создать анкету (один раз для пользователя)"""
    anketa_repo = AnketaRepository(db)
    
    # Проверяем, не создана ли уже анкета
    existing = await anketa_repo.get_by_user_id(current_user.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Anketa already exists. Use PUT to update it."
        )
    
    # Создаем анкету
    anketa = UserAnketa(
        user_id=current_user.id,
        name=anketa_data.name,
        last_name=anketa_data.last_name,
        role=anketa_data.role,
        contacts=anketa_data.contacts,
        skills=anketa_data.skills,
        experience=anketa_data.experience,
        bio=anketa_data.bio
    )
    
    created = await anketa_repo.create(anketa)
    return AnketaResponse.model_validate(created)


@router.get("/me", response_model=AnketaResponse)
async def get_my_anketa(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить свою анкету"""
    anketa_repo = AnketaRepository(db)
    anketa = await anketa_repo.get_by_user_id(current_user.id)
    if not anketa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anketa not found"
        )
    return AnketaResponse.model_validate(anketa)


@router.put("/me", response_model=AnketaResponse)
async def update_anketa(
    anketa_data: AnketaUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Обновить свою анкету"""
    anketa_repo = AnketaRepository(db)
    anketa = await anketa_repo.get_by_user_id(current_user.id)
    if not anketa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anketa not found"
        )
    
    update_data = anketa_data.model_dump(exclude_unset=True)
    updated = await anketa_repo.update(anketa.id, **update_data)
    return AnketaResponse.model_validate(updated)


@router.get("/hackathon/{hackathon_id}/participants", response_model=List[AnketaWithUser])
async def get_hackathon_participants(
    hackathon_id: UUID,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить список участников хакатона (участники = пользователи в командах хакатона)"""
    
    team_repo = TeamRepository(db)
    anketa_repo = AnketaRepository(db)
    
    # Получаем всех пользователей, которые состоят в командах этого хакатона
    teams = await team_repo.get_by_hackathon(hackathon_id, skip=0, limit=1000)
    
    user_ids = set()
    for team in teams:
        for member in team.members:
            user_ids.add(member.user_id)
    
    # Получаем анкеты этих пользователей
    if not user_ids:
        return []
    
    result = []
    for user_id in list(user_ids)[skip:skip+limit]:
        anketa = await anketa_repo.get_by_user_id(user_id)
        if anketa:
            # Загружаем пользователя
            from repositories.user_repository import UserRepository
            user_repo = UserRepository(db)
            user = await user_repo.get_by_id(user_id)
            if user:
                anketa.user = user
                result.append(AnketaWithUser.model_validate(anketa))
    
    return result

