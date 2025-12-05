from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from presentations.api.v1.dependencies import get_db, get_current_admin
from presentations.schemas.anketa import AnketaWithUser
from persistent.db.models import Administrator
from repositories.anketa_repository import AnketaRepository
from repositories.team_repository import TeamRepository
from repositories.user_repository import UserRepository

router = APIRouter()


@router.get("/hackathon/{hackathon_id}", response_model=List[AnketaWithUser])
async def get_hackathon_participants(
    hackathon_id: UUID,
    skip: int = 0,
    limit: int = 100,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Получить всех участников хакатона (участники = пользователи в командах хакатона)"""
    team_repo = TeamRepository(db)
    anketa_repo = AnketaRepository(db)
    user_repo = UserRepository(db)
    
    # Получаем все команды хакатона
    teams = await team_repo.get_by_hackathon(hackathon_id, skip=0, limit=1000)
    
    # Собираем уникальные ID пользователей из всех команд
    user_ids = set()
    for team in teams:
        for member in team.members:
            user_ids.add(member.user_id)
    
    if not user_ids:
        return []
    
    # Получаем анкеты этих пользователей
    result = []
    user_ids_list = list(user_ids)[skip:skip+limit]
    
    for user_id in user_ids_list:
        anketa = await anketa_repo.get_by_user_id(user_id)
        if anketa:
            user = await user_repo.get_by_id(user_id)
            if user:
                anketa.user = user
                result.append(AnketaWithUser.model_validate(anketa))
    
    return result
