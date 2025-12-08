from typing import Optional, List
from unittest import result
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload

from repositories.base_repository import BaseRepository
from persistent.db.models import Team, TeamMember, User


class TeamRepository(BaseRepository[Team]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Team)

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Team]:
        result = await self.session.execute(
            select(Team)
            .options(selectinload(Team.members).selectinload(TeamMember.user))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_hackathon(
        self, hackathon_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Team]:
        result = await self.session.execute(
            select(Team)
            .where(Team.id_hackathon == hackathon_id)
            .options(selectinload(Team.members).selectinload(TeamMember.user))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_user_and_hackathon(
        self, user_id: UUID, hackathon_id: UUID
    ) -> Optional[Team]:
        result = await self.session.execute(
            select(Team)
            .join(TeamMember)
            .where(
                and_(
                    Team.id_hackathon == hackathon_id,
                    TeamMember.user_id == user_id
                )
            )
            .options(selectinload(Team.members).selectinload(TeamMember.user))
        )
        return result.scalar_one_or_none()

    async def get_team_members_count(self, team_id: UUID) -> int:
        result = await self.session.execute(
            select(func.count(TeamMember.user_id))
            .where(TeamMember.team_id == team_id)
        )
        return result.scalar_one() or 0

    async def add_member(self, team_id: UUID, user_id: UUID) -> TeamMember:
        member = TeamMember(team_id=team_id, user_id=user_id)
        self.session.add(member)
        await self.session.commit()
        await self.session.refresh(member)
        return member

    async def remove_member(self, team_id: UUID, user_id: UUID) -> bool:
        result = await self.session.execute(
            select(TeamMember).where(
                and_(
                    TeamMember.team_id == team_id,
                    TeamMember.user_id == user_id
                )
            )
        )
        member = result.scalar_one_or_none()
        if member:
            await self.session.delete(member)
            await self.session.commit()
            return True
        return False

    async def is_user_in_team(self, team_id: UUID, user_id: UUID) -> bool:
        result = await self.session.execute(
            select(TeamMember).where(
                TeamMember.team_id == team_id,
                TeamMember.user_id == user_id
            )
        )
        return result.scalar_one_or_none() is not None
    
    async def get_user_teams(self, user_id: UUID) -> List[Team]:
        result = await self.session.execute(
            select(Team)
            .join(TeamMember, Team.id == TeamMember.team_id)
            .where(
                TeamMember.user_id == user_id,
                Team.is_active == True
            )
            .options(selectinload(Team.members).selectinload(TeamMember.user))
            .distinct()
        )
        return result.scalars().all()


    async def get_team_members(self, team_id: UUID) -> List[TeamMember]:
        result = await self.session.execute(
            select(TeamMember)
            .where(TeamMember.team_id == team_id)
            .options(selectinload(TeamMember.user))  
        )
        return result.scalars().all()
