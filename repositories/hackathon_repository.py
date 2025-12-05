from typing import List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from repositories.base_repository import BaseRepository
from persistent.db.models import Hackathon


class HackathonRepository(BaseRepository[Hackathon]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Hackathon)

    async def get_active(self, skip: int = 0, limit: int = 100) -> List[Hackathon]:
        """Получить активные хакатоны (где регистрация открыта)"""
        now = datetime.utcnow()
        result = await self.session.execute(
            select(Hackathon).where(
                and_(
                    Hackathon.register_start <= now,
                    Hackathon.register_end >= now
                )
            ).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def get_available(self, skip: int = 0, limit: int = 100) -> List[Hackathon]:
        """Получить доступные хакатоны (где регистрация еще не закончилась)"""
        now = datetime.utcnow()
        result = await self.session.execute(
            select(Hackathon).where(
                Hackathon.register_end >= now
            ).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

