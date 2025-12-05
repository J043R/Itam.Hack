from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from repositories.base_repository import BaseRepository
from persistent.db.models import Administrator


class AdminRepository(BaseRepository[Administrator]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Administrator)

    async def get_by_email(self, email: str) -> Optional[Administrator]:
        """Получить администратора по email"""
        result = await self.session.execute(
            select(Administrator).where(Administrator.email == email)
        )
        return result.scalar_one_or_none()

