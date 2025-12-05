from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from presentations.api.v1.dependencies import get_db, get_current_admin
from presentations.schemas.hackathon import HackathonCreate, HackathonUpdate, HackathonResponse
from persistent.db.models import Administrator, Hackathon
from repositories.hackathon_repository import HackathonRepository

router = APIRouter()


@router.post("", response_model=HackathonResponse, status_code=status.HTTP_201_CREATED)
async def create_hackathon(
    hackathon_data: HackathonCreate,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Создать хакатон"""
    hackathon_repo = HackathonRepository(db)
    
    hackathon = Hackathon(
        name=hackathon_data.name,
        describe=hackathon_data.describe,
        date_starts=hackathon_data.date_starts,
        date_end=hackathon_data.date_end,
        register_start=hackathon_data.register_start,
        register_end=hackathon_data.register_end,
        created_by=current_admin.id
    )
    
    created = await hackathon_repo.create(hackathon)
    return HackathonResponse.model_validate(created)


@router.get("", response_model=List[HackathonResponse])
async def get_all_hackathons(
    skip: int = 0,
    limit: int = 100,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Получить все хакатоны"""
    hackathon_repo = HackathonRepository(db)
    hackathons = await hackathon_repo.get_all(skip, limit)
    return [HackathonResponse.model_validate(h) for h in hackathons]


@router.put("/{hackathon_id}", response_model=HackathonResponse)
async def update_hackathon(
    hackathon_id: UUID,
    hackathon_data: HackathonUpdate,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Обновить хакатон"""
    hackathon_repo = HackathonRepository(db)
    hackathon = await hackathon_repo.get_by_id(hackathon_id)
    
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )
    
    update_data = hackathon_data.model_dump(exclude_unset=True)
    updated = await hackathon_repo.update(hackathon_id, **update_data)
    return HackathonResponse.model_validate(updated)


@router.delete("/{hackathon_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hackathon(
    hackathon_id: UUID,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Удалить хакатон"""
    hackathon_repo = HackathonRepository(db)
    deleted = await hackathon_repo.delete(hackathon_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )

