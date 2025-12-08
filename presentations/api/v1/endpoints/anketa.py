from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from presentations.api.v1.dependencies import get_db, get_current_user
from presentations.schemas.anketa import AnketaCreate, AnketaUpdate, AnketaResponse
from persistent.db.models import User, UserAnketa
from repositories.anketa_repository import AnketaRepository

router = APIRouter()


@router.post("", response_model=AnketaResponse, status_code=status.HTTP_201_CREATED)
async def create_anketa(
    anketa_data: AnketaCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    anketa_repo = AnketaRepository(db)
    
    existing = await anketa_repo.get_by_user_id(current_user.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Анкета уже создана. Используйте PUT для обновления."
        )
    
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


