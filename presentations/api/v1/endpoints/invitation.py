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
from repositories.hackathon_registration_repository import HackathonRegistrationRepository
from repositories.anketa_repository import AnketaRepository

router = APIRouter()


@router.post("", response_model=InvitationResponse, status_code=status.HTTP_201_CREATED)
async def create_invitation(
    invitation_data: InvitationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    invitation_repo = InvitationRepository(db)
    team_repo = TeamRepository(db)
    anketa_repo = AnketaRepository(db)
    
    team = await team_repo.get_by_id(invitation_data.team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    if team.id_capitan != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team captain can send invitations"
        )
    
    if invitation_data.receiver_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot invite yourself"
        )
    
    anketa = await anketa_repo.get_by_user_id(invitation_data.receiver_id)
    if not anketa:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Receiver must have an anketa"
        )
    
    existing_team = await team_repo.get_by_user_and_hackathon(
        invitation_data.receiver_id, team.id_hackathon
    )
    if existing_team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already in a team for this hackathon"
        )
    
    existing_invitation = await invitation_repo.get_by_team_and_receiver(
        invitation_data.team_id, invitation_data.receiver_id
    )
    if existing_invitation and existing_invitation.status == "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation already exists"
        )
    
    members_count = await team_repo.get_team_members_count(team.id)
    if members_count >= team.max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team is full"
        )
    
    invitation = Invitation(
        team_id=invitation_data.team_id,
        sender_id=current_user.id,
        receiver_id=invitation_data.receiver_id,
        invitation_type=invitation_data.invitation_type,
        status="pending"
    )
    
    created = await invitation_repo.create(invitation)
    return InvitationResponse.model_validate(created)


@router.get("/my", response_model=List[dict])
async def get_my_invitations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from repositories.user_repository import UserRepository
    from repositories.hackathon_repository import HackathonRepository
    
    invitation_repo = InvitationRepository(db)
    team_repo = TeamRepository(db)
    user_repo = UserRepository(db)
    hackathon_repo = HackathonRepository(db)
    
    invitations = await invitation_repo.get_pending_by_receiver(current_user.id)
    
    result = []
    for inv in invitations:
        # Получаем данные отправителя
        sender = await user_repo.get_by_id(inv.sender_id)
        # Получаем данные команды
        team = await team_repo.get_by_id(inv.team_id)
        # Получаем данные хакатона
        hackathon = await hackathon_repo.get_by_id(team.id_hackathon) if team else None
        
        result.append({
            "id": str(inv.id),
            "type": "invitation" if inv.invitation_type == "team_invite" else inv.invitation_type,
            "status": inv.status,
            "created_at": inv.created_at.isoformat(),
            "fromUser": {
                "id": str(sender.id) if sender else "",
                "name": sender.first_name if sender else "",
                "surname": sender.last_name or "" if sender else ""
            },
            "team": {
                "id": str(team.id) if team else "",
                "name": team.name if team else ""
            },
            "hackathon": {
                "id": str(hackathon.id) if hackathon else "",
                "name": hackathon.name if hackathon else ""
            }
        })
    
    return result


@router.put("/{invitation_id}/respond", response_model=InvitationResponse)
async def respond_to_invitation(
    invitation_id: UUID,
    response_data: InvitationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    invitation_repo = InvitationRepository(db)
    team_repo = TeamRepository(db)
    registration_repo = HackathonRegistrationRepository(db)
    
    invitation = await invitation_repo.get_by_id(invitation_id)
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )
    
    if invitation.receiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the receiver of this invitation"
        )
    
    if invitation.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation already processed"
        )
    
    if response_data.status == "accepted":
        team = await team_repo.get_by_id(invitation.team_id)
        if not team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found"
            )

        registration = await registration_repo.get_by_user_and_hackathon(
            current_user.id, team.id_hackathon
        )
        if not registration:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Сначала зарегистрируйтесь на хакатон. Используйте POST /api/v1/hackathons/{hackathon_id}/register"
            )
        
        await team_repo.add_member(invitation.team_id, current_user.id)
        
        members_count = await team_repo.get_team_members_count(team.id)
        if members_count >= team.max_size:
            await team_repo.update(team.id, status="full")
    
    updated = await invitation_repo.update(
        invitation_id,
        status=response_data.status,
        read_at=datetime.utcnow()
    )
    
    return InvitationResponse.model_validate(updated)



@router.post("/{invitation_id}/accept")
async def accept_invitation(
    invitation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Принять приглашение в команду"""
    invitation_repo = InvitationRepository(db)
    team_repo = TeamRepository(db)
    registration_repo = HackathonRegistrationRepository(db)
    
    invitation = await invitation_repo.get_by_id(invitation_id)
    if not invitation:
        raise HTTPException(status_code=404, detail="Приглашение не найдено")
    
    if invitation.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Это приглашение не для вас")
    
    if invitation.status != "pending":
        raise HTTPException(status_code=400, detail="Приглашение уже обработано")
    
    team = await team_repo.get_by_id(invitation.team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Команда не найдена")
    
    # Сохраняем значения до асинхронных операций чтобы избежать lazy loading
    team_id = team.id
    hackathon_id = team.id_hackathon
    
    # Проверяем регистрацию на хакатон, если нет - авто
    registration = await registration_repo.get_by_user_and_hackathon(
        current_user.id, hackathon_id
    )
    if not registration:
        raise HTTPException(status_code=400, detail="Сначала зарегистрируйтесь на хакатон")
    
    # Проверяем, не в команде ли уже
    existing_team = await team_repo.get_by_user_and_hackathon(current_user.id, hackathon_id)
    if existing_team:
        raise HTTPException(status_code=400, detail="Вы уже в команде на этом хакатоне")
    
    # Добавляем в команду
    await team_repo.add_member(team_id, current_user.id)
    
    # Обновляем статус приглашения
    await invitation_repo.update(invitation_id, status="accepted", read_at=datetime.utcnow())
    
    return {"message": "Приглашение принято", "team_id": str(team_id)}


@router.post("/{invitation_id}/reject")
async def reject_invitation(
    invitation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Отклонить приглашение в команду"""
    invitation_repo = InvitationRepository(db)
    
    invitation = await invitation_repo.get_by_id(invitation_id)
    if not invitation:
        raise HTTPException(status_code=404, detail="Приглашение не найдено")
    
    if invitation.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Это приглашение не для вас")
    
    if invitation.status != "pending":
        raise HTTPException(status_code=400, detail="Приглашение уже обработано")
    
    # Обновляем статус приглашения
    await invitation_repo.update(invitation_id, status="rejected", read_at=datetime.utcnow())
    
    return {"message": "Приглашение отклонено"}
