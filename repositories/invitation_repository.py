from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload

from repositories.base_repository import BaseRepository
from persistent.db.models import Invitation, Team, User


class InvitationRepository(BaseRepository[Invitation]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Invitation)

    async def get_pending_by_receiver(
        self, receiver_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Invitation]:
        """Получить все pending приглашения для пользователя"""
        result = await self.session.execute(
            select(Invitation)
            .where(
                and_(
                    Invitation.receiver_id == receiver_id,
                    Invitation.status == "pending"
                )
            )
            .options(
                selectinload(Invitation.team),
                selectinload(Invitation.team).selectinload(Team.hackathon)
            )
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_team_and_receiver(
        self, team_id: UUID, receiver_id: UUID
    ) -> Optional[Invitation]:
        """Получить приглашение по команде и получателю"""
        result = await self.session.execute(
            select(Invitation).where(
                and_(
                    Invitation.team_id == team_id,
                    Invitation.receiver_id == receiver_id
                )
            )
        )
        return result.scalar_one_or_none()

    async def get_by_team(
        self, team_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Invitation]:
        """Получить все приглашения команды"""
        result = await self.session.execute(
            select(Invitation)
            .where(Invitation.team_id == team_id)
            .options(selectinload(Invitation.team))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

