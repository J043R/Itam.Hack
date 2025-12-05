from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from repositories.base_repository import BaseRepository
from persistent.db.models import UserAnketa


class AnketaRepository(BaseRepository[UserAnketa]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, UserAnketa)

    async def get_by_user_id(self, user_id: UUID) -> Optional[UserAnketa]:
        """Получить анкету пользователя"""
        result = await self.session.execute(
            select(UserAnketa).where(UserAnketa.user_id == user_id)
        )
        return result.scalar_one_or_none()

