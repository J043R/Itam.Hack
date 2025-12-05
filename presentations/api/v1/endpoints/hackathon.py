from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from presentations.api.v1.dependencies import get_db, get_current_user
from presentations.schemas.hackathon import HackathonResponse
from persistent.db.models import User
from repositories.hackathon_repository import HackathonRepository

router = APIRouter()


@router.get("", response_model=List[HackathonResponse])
async def get_available_hackathons(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Получить список доступных хакатонов"""
    hackathon_repo = HackathonRepository(db)
    hackathons = await hackathon_repo.get_available(skip, limit)
    return [HackathonResponse.model_validate(h) for h in hackathons]


@router.get("/active", response_model=List[HackathonResponse])
async def get_active_hackathons(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Получить список активных хакатонов (с открытой регистрацией)"""
    hackathon_repo = HackathonRepository(db)
    hackathons = await hackathon_repo.get_active(skip, limit)
    return [HackathonResponse.model_validate(h) for h in hackathons]

