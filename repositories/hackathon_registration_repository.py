from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from repositories.base_repository import BaseRepository
from persistent.db.models import HackathonRegistration


class HackathonRegistrationRepository(BaseRepository[HackathonRegistration]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, HackathonRegistration)

    async def get_by_user_and_hackathon(
        self, user_id: UUID, hackathon_id: UUID
    ) -> Optional[HackathonRegistration]:
        result = await self.session.execute(
            select(HackathonRegistration).where(
                and_(
                    HackathonRegistration.user_id == user_id,
                    HackathonRegistration.hackathon_id == hackathon_id
                )
            )
        )
        return result.scalar_one_or_none()

    async def get_by_hackathon(
        self, hackathon_id: UUID
    ) -> List[HackathonRegistration]:
        result = await self.session.execute(
            select(HackathonRegistration).where(
                HackathonRegistration.hackathon_id == hackathon_id
            )
        )
        return result.scalars().all()

    async def get_by_user(
        self, user_id: UUID
    ) -> List[HackathonRegistration]:
        result = await self.session.execute(
            select(HackathonRegistration).where(
                HackathonRegistration.user_id == user_id
            )
        )
        return result.scalars().all()

    async def delete_registration(
        self, user_id: UUID, hackathon_id: UUID
    ) -> bool:
        registration = await self.get_by_user_and_hackathon(user_id, hackathon_id)
        if registration:
            await self.session.delete(registration)
            await self.session.commit()
            return True
        return False

