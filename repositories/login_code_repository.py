from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_

from repositories.base_repository import BaseRepository
from persistent.db.models import LoginCode


class LoginCodeRepository(BaseRepository[LoginCode]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, LoginCode)

    async def get_by_code(self, code: str) -> Optional[LoginCode]:
        result = await self.session.execute(
            select(LoginCode).where(LoginCode.code == code)
        )
        return result.scalar_one_or_none()

    async def get_valid_code(self, code: str) -> Optional[LoginCode]:
        now = datetime.utcnow()
        result = await self.session.execute(
            select(LoginCode).where(
                and_(
                    LoginCode.code == code,
                    LoginCode.is_used == False,
                    LoginCode.expires_at > now
                )
            )
        )
        return result.scalar_one_or_none()

    async def mark_as_used(self, code_id, used_at: datetime) -> bool:
        result = await self.session.execute(
            update(LoginCode)
            .where(LoginCode.id == code_id)
            .values(is_used=True, used_at=used_at)
        )
        await self.session.commit()
        return result.rowcount > 0

    async def cleanup_expired_codes(self) -> int:
        now = datetime.utcnow()
        result = await self.session.execute(
            select(LoginCode).where(
                and_(
                    LoginCode.expires_at < now,
                    LoginCode.is_used == False
                )
            )
        )
        codes = result.scalars().all()
        count = len(codes)
        for code in codes:
            await self.session.delete(code)
        await self.session.commit()
        return count

