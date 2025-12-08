from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List

from presentations.api.v1.dependencies import get_db, get_current_user
from persistent.db.models import User, UserAchievement
from repositories.user_repository import UserRepository
from repositories.anketa_repository import AnketaRepository
from repositories.team_repository import TeamRepository
from presentations.schemas.profile import ProfileResponse, ProfileUpdateRequest, AchievementResponse
from sqlalchemy import select
from sqlalchemy.orm import selectinload

router = APIRouter()


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_repo = UserRepository(db)
    anketa_repo = AnketaRepository(db)

    anketa = await anketa_repo.get_by_user_id(current_user.id)

    result = await db.execute(
        select(UserAchievement)
        .where(UserAchievement.user_id == current_user.id)
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
    
    return ProfileResponse(
        user_id=current_user.id,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        avatar_url=current_user.avatar_url,
        role=anketa.role if anketa else None,
        university=anketa.university if anketa else None,
        bio=anketa.bio if anketa else None,
        achievements=achievements_list
    )


@router.get("/{user_id}", response_model=ProfileResponse)
async def get_user_profile(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_repo = UserRepository(db)
    anketa_repo = AnketaRepository(db)
    
    # Получаем пользователя
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    anketa = await anketa_repo.get_by_user_id(user_id)
    
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


@router.put("/me", response_model=ProfileResponse)
async def update_my_profile(
    profile_data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    user_id = current_user.id
    
    user_repo = UserRepository(db)
    anketa_repo = AnketaRepository(db)
    
    if profile_data.first_name is not None:
        current_user.first_name = profile_data.first_name
    if profile_data.last_name is not None:
        current_user.last_name = profile_data.last_name
    
    await db.commit()
    await db.refresh(current_user)
    
    anketa = await anketa_repo.get_by_user_id(user_id)
    if anketa:
        if profile_data.role is not None:
            anketa.role = profile_data.role
        if profile_data.university is not None:
            anketa.university = profile_data.university
        if profile_data.bio is not None:
            anketa.bio = profile_data.bio
        await db.commit()
        await db.refresh(anketa)
    else:
        if profile_data.role:
            from persistent.db.models import UserAnketa
            user = await user_repo.get_by_id(user_id)
            anketa = UserAnketa(
                user_id=user_id,
                name=user.first_name if user else current_user.first_name,
                last_name=user.last_name or "" if user else (current_user.last_name or ""),
                role=profile_data.role,
                contacts="",  # Обязательное поле
                university=profile_data.university,
                bio=profile_data.bio
            )
            db.add(anketa)
            await db.commit()
            await db.refresh(anketa)
    
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
    
    user = await user_repo.get_by_id(user_id)
    anketa = await anketa_repo.get_by_user_id(user_id)
    
    return ProfileResponse(
        user_id=user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        avatar_url=user.avatar_url,
        role=anketa.role if anketa else None,
        university=anketa.university if anketa else None,
        bio=anketa.bio if anketa else None,
        achievements=achievements_list
    )


@router.get("/me/achievements", response_model=List[AchievementResponse])
async def get_my_achievements(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить все свои достижения"""
    result = await db.execute(
        select(UserAchievement)
        .where(UserAchievement.user_id == current_user.id)
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


@router.get("/{user_id}/achievements", response_model=List[AchievementResponse])
async def get_user_achievements(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить достижения пользователя по ID"""
    user_repo = UserRepository(db)
    
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


@router.get("/{user_id}/teams")
async def get_user_teams(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить команды пользователя по ID"""
    user_repo = UserRepository(db)
    team_repo = TeamRepository(db)
    
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    teams = await team_repo.get_user_teams(user_id)
    
    return [
        {
            "id": team.id,
            "name": team.name,
            "hackathon_id": team.id_hackathon,
            "created_at": team.created_at
        }
        for team in teams
    ]
