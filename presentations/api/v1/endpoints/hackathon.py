from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import random

from presentations.api.v1.dependencies import get_db, get_current_user
from presentations.schemas.hackathon import HackathonResponse, HackathonInfoResponse, HackathonParticipantInfo
from presentations.schemas.anketa import AnketaWithUser
from persistent.db.models import User, HackathonRegistration
from repositories.hackathon_repository import HackathonRepository
from repositories.hackathon_registration_repository import HackathonRegistrationRepository
from repositories.team_repository import TeamRepository
from repositories.anketa_repository import AnketaRepository
from repositories.user_repository import UserRepository
from sqlalchemy import select, func

router = APIRouter()


@router.get("", response_model=List[HackathonResponse])
async def get_available_hackathons(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    hackathon_repo = HackathonRepository(db)
    hackathons = await hackathon_repo.get_available(skip, limit)
    return [HackathonResponse.model_validate(h) for h in hackathons]


@router.get("/active", response_model=List[HackathonResponse])
async def get_active_hackathons(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    hackathon_repo = HackathonRepository(db)
    hackathons = await hackathon_repo.get_active(skip, limit)
    return [HackathonResponse.model_validate(h) for h in hackathons]


@router.get("/my", response_model=List[HackathonResponse])
async def get_my_hackathons(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    hackathon_repo = HackathonRepository(db)
    registration_repo = HackathonRegistrationRepository(db)
    
    registrations = await registration_repo.get_by_user(current_user.id)
    
    if not registrations:
        return []
    
    hackathons = []
    for reg in registrations:
        hackathon = await hackathon_repo.get_by_id(reg.hackathon_id)
        if hackathon:
            hackathons.append(HackathonResponse.model_validate(hackathon))
    
    return hackathons


@router.post("/{hackathon_id}/register", status_code=status.HTTP_201_CREATED)
async def register_for_hackathon(
    hackathon_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    hackathon_repo = HackathonRepository(db)
    registration_repo = HackathonRegistrationRepository(db)
    anketa_repo = AnketaRepository(db)
    
    hackathon = await hackathon_repo.get_by_id(hackathon_id)
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Хакатон не найден"
        )
    
    hackathon_name = hackathon.name
    register_start = hackathon.register_start
    register_end = hackathon.register_end
    
    anketa = await anketa_repo.get_by_user_id(current_user.id)
    if not anketa:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Сначала создайте анкету"
        )
    
    now = datetime.now()
    if now < register_start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Регистрация начнется {register_start.strftime('%Y-%m-%d %H:%M')}"
        )
    if now > register_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Регистрация уже закрыта (закрыта {register_end.strftime('%Y-%m-%d %H:%M')})"
        )
    
    existing_registration = await registration_repo.get_by_user_and_hackathon(
        current_user.id, hackathon_id
    )
    if existing_registration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вы уже зарегистрированы на этот хакатон"
        )
    
    registration = HackathonRegistration(
        hackathon_id=hackathon_id,
        user_id=current_user.id
    )
    await registration_repo.create(registration)
    
    return {
        "message": f"Вы успешно зарегистрированы на хакатон '{hackathon_name}'",
        "hackathon_id": str(hackathon_id),
        "hackathon_name": hackathon_name,
        "registered_at": registration.registered_at
    }


@router.post("/{hackathon_id}/leave", status_code=status.HTTP_200_OK)
async def leave_hackathon(
    hackathon_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    hackathon_repo = HackathonRepository(db)
    team_repo = TeamRepository(db)
    registration_repo = HackathonRegistrationRepository(db)
    
    hackathon = await hackathon_repo.get_by_id(hackathon_id)
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Хакатон не найден"
        )
    
    hackathon_name = hackathon.name
    
    registration = await registration_repo.get_by_user_and_hackathon(
        current_user.id, hackathon_id
    )
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вы не зарегистрированы на этот хакатон"
        )

    user_teams = await team_repo.get_user_teams(current_user.id)
    hackathon_teams = [team for team in user_teams if team.id_hackathon == hackathon_id and team.is_active]
    
    left_teams = []
    
    for team in hackathon_teams:
        team_id = team.id
        team_name = team.name
        is_captain = team.id_capitan == current_user.id
        
        await team_repo.remove_member(team_id, current_user.id)
        
        if is_captain:
            remaining_members = await team_repo.get_team_members(team_id)
            other_members = [m for m in remaining_members if m.user_id != current_user.id]
            
            if not other_members:
                team.is_active = False
                team.deleted_at = datetime.utcnow()
                team.deleted_by = current_user.id
                left_teams.append({
                    "team_id": str(team_id),
                    "team_name": team_name,
                    "status": "disbanded",
                    "reason": "Вы были капитаном, команда распущена"
                })
            else:
                new_captain = random.choice(other_members)
                team.id_capitan = new_captain.user_id
                left_teams.append({
                    "team_id": str(team_id),
                    "team_name": team_name,
                    "status": "left",
                    "new_captain_id": str(new_captain.user_id),
                    "reason": "Назначен новый капитан"
                })
        else:
            left_teams.append({
                "team_id": str(team_id),
                "team_name": team_name,
                "status": "left",
                "reason": "Вы покинули команду"
            })

    await registration_repo.delete_registration(current_user.id, hackathon_id)
    
    await db.commit()
    
    return {
        "message": f"Вы покинули хакатон '{hackathon_name}'",
        "hackathon_id": str(hackathon_id),
        "hackathon_name": hackathon_name,
        "left_teams": left_teams,
        "teams_count": len(left_teams),
        "registration_cancelled": True
    }


@router.get("/{hackathon_id}/info", response_model=HackathonInfoResponse)
async def get_hackathon_info(
    hackathon_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Получить полную информацию о хакатоне с участниками"""
    hackathon_repo = HackathonRepository(db)
    team_repo = TeamRepository(db)
    anketa_repo = AnketaRepository(db)
    user_repo = UserRepository(db)
    registration_repo = HackathonRegistrationRepository(db)
    
    hackathon = await hackathon_repo.get_by_id(hackathon_id)
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Хакатон не найден"
        )
    
    teams = await team_repo.get_by_hackathon(hackathon_id, skip=0, limit=1000)
    active_teams = [t for t in teams if t.is_active]
    
    total_teams = len(active_teams)
    
    user_team_map = {} 
    for team in active_teams:
        members = await team_repo.get_team_members(team.id)
        for member in members:
            is_captain = team.id_capitan == member.user_id
            user_team_map[member.user_id] = (team.name, is_captain)
    
    registrations = await registration_repo.get_by_hackathon(hackathon_id)
    
    participants_data = []
    for reg in registrations:
        user = await user_repo.get_by_id(reg.user_id)
        if not user:
            continue
        
        anketa = await anketa_repo.get_by_user_id(reg.user_id)
        
        team_info = user_team_map.get(reg.user_id)
        team_name = team_info[0] if team_info else None
        is_captain = team_info[1] if team_info else False
        
        participants_data.append(HackathonParticipantInfo(
            user_id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            telegram_username=user.telegram_user_name,
            role=anketa.role if anketa else None,
            university=anketa.university if anketa else None,
            team_name=team_name,
            is_captain=is_captain
        ))
    
    return HackathonInfoResponse(
        id=hackathon.id,
        name=hackathon.name,
        describe=hackathon.describe,
        date_starts=hackathon.date_starts,
        date_end=hackathon.date_end,
        register_start=hackathon.register_start,
        register_end=hackathon.register_end,
        created_at=hackathon.created_at,
        total_participants=len(participants_data),
        total_teams=total_teams,
        participants=participants_data
    )


@router.get("/{hackathon_id}/participants", response_model=List[AnketaWithUser])
async def get_hackathon_participants(
    hackathon_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    anketa_repo = AnketaRepository(db)
    user_repo = UserRepository(db)
    registration_repo = HackathonRegistrationRepository(db)
    
    hackathon_repo = HackathonRepository(db)
    hackathon = await hackathon_repo.get_by_id(hackathon_id)
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Хакатон не найден"
        )
    
    registrations = await registration_repo.get_by_hackathon(hackathon_id)
    
    if not registrations:
        return []
    
    paginated_registrations = registrations[skip:skip + limit]
    
    result = []
    for reg in paginated_registrations:
        anketa = await anketa_repo.get_by_user_id(reg.user_id)
        if anketa:
            user = await user_repo.get_by_id(reg.user_id)
            if user:
                anketa.user = user
                result.append(AnketaWithUser.model_validate(anketa))
    
    return result
