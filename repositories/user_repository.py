from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from repositories.base_repository import BaseRepository
from persistent.db.models import User


class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, User)

    async def get_by_telegram_id(self, telegram_id: str) -> Optional[User]:
        """Получить пользователя по Telegram ID"""
        result = await self.session.execute(
            select(User).where(User.telegram_id == telegram_id)
        )
        return result.scalar_one_or_none()

    async def create_or_update_from_telegram(
        self, 
        telegram_id: str,
        telegram_username: Optional[str],
        telegram_hash: str,
        first_name: str,
        last_name: Optional[str] = None,
        avatar_url: Optional[str] = None
    ) -> User:
        """Создать или обновить пользователя из данных Telegram"""
        user = await self.get_by_telegram_id(telegram_id)
        
        if user:
            # Обновляем существующего пользователя
            user.telegram_user_name = telegram_username
            user.telegram_hash = telegram_hash
            user.first_name = first_name
            user.last_name = last_name
            if avatar_url:
                user.avatar_url = avatar_url
            await self.session.commit()
            await self.session.refresh(user)
            return user
        else:
            # Создаем нового пользователя
            user = User(
                telegram_id=telegram_id,
                telegram_user_name=telegram_username,
                telegram_hash=telegram_hash,
                first_name=first_name,
                last_name=last_name,
                avatar_url=avatar_url
            )
            return await self.create(user)

