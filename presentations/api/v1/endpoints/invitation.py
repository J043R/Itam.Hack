from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from presentations.api.v1.dependencies import get_db, get_current_user
from presentations.schemas.invitation import InvitationCreate, InvitationResponse, InvitationUpdate
from persistent.db.models import User, Invitation, Team, TeamMember
from repositories.invitation_repository import InvitationRepository
from repositories.team_repository import TeamRepository
from repositories.anketa_repository import AnketaRepository

router = APIRouter()


@router.post("", response_model=InvitationResponse, status_code=status.HTTP_201_CREATED)
async def create_invitation(
    invitation_data: InvitationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Создать приглашение в команду"""
    invitation_repo = InvitationRepository(db)
    team_repo = TeamRepository(db)
    anketa_repo = AnketaRepository(db)
    
    # Проверяем, существует ли команда
    team = await team_repo.get_by_id(invitation_data.team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Проверяем, что текущий пользователь - капитан команды
    if team.id_capitan != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team captain can send invitations"
        )
    
    # Проверяем, что получатель не является капитаном
    if invitation_data.receiver_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot invite yourself"
        )
    
    # Проверяем, что получатель имеет анкету
    anketa = await anketa_repo.get_by_user_id(invitation_data.receiver_id)
    if not anketa:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Receiver must have an anketa"
        )
    
    # Проверяем, не состоит ли получатель уже в команде
    existing_team = await team_repo.get_by_user_and_hackathon(
        invitation_data.receiver_id, team.id_hackathon
    )
    if existing_team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already in a team for this hackathon"
        )
    
    # Проверяем, не существует ли уже pending приглашение
    existing_invitation = await invitation_repo.get_by_team_and_receiver(
        invitation_data.team_id, invitation_data.receiver_id
    )
    if existing_invitation and existing_invitation.status == "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation already exists"
        )
    
    # Проверяем, не заполнена ли команда
    members_count = await team_repo.get_team_members_count(team.id)
    if members_count >= team.max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team is full"
        )
    
    # Создаем приглашение
    invitation = Invitation(
        team_id=invitation_data.team_id,
        sender_id=current_user.id,
        receiver_id=invitation_data.receiver_id,
        invitation_type=invitation_data.invitation_type,
        status="pending"
    )
    
    created = await invitation_repo.create(invitation)
    return InvitationResponse.model_validate(created)


@router.get("/my", response_model=List[InvitationResponse])
async def get_my_invitations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить мои приглашения"""
    invitation_repo = InvitationRepository(db)
    invitations = await invitation_repo.get_pending_by_receiver(current_user.id)
    return [InvitationResponse.model_validate(i) for i in invitations]


@router.put("/{invitation_id}/respond", response_model=InvitationResponse)
async def respond_to_invitation(
    invitation_id: UUID,
    response_data: InvitationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Принять или отклонить приглашение"""
    invitation_repo = InvitationRepository(db)
    team_repo = TeamRepository(db)
    
    invitation = await invitation_repo.get_by_id(invitation_id)
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )
    
    # Проверяем, что пользователь - получатель приглашения
    if invitation.receiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the receiver of this invitation"
        )
    
    # Проверяем, что приглашение еще pending
    if invitation.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation already processed"
        )
    
    # Обновляем статус
    if response_data.status == "accepted":
        # Добавляем пользователя в команду
        await team_repo.add_member(invitation.team_id, current_user.id)
        
        # Проверяем, не заполнилась ли команда
        team = await team_repo.get_by_id(invitation.team_id)
        if team:
            members_count = await team_repo.get_team_members_count(team.id)
            if members_count >= team.max_size:
                await team_repo.update(team.id, status="full")
    
    updated = await invitation_repo.update(
        invitation_id,
        status=response_data.status,
        read_at=datetime.utcnow()
    )
    
    return InvitationResponse.model_validate(updated)

