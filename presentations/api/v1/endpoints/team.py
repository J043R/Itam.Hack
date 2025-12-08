from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from fastapi import Response
import random
import uuid

from presentations.api.v1.dependencies import get_db, get_current_user
from presentations.schemas.team import TeamCreate, TeamUpdate, TeamSimpleResponse, TeamWithMembers, TeamResponse
from persistent.db.models import User, Team, TeamMember
from repositories.team_repository import TeamRepository
from repositories.hackathon_repository import HackathonRepository
from repositories.hackathon_registration_repository import HackathonRegistrationRepository
from repositories.anketa_repository import AnketaRepository

router = APIRouter()


@router.post("", response_model=TeamSimpleResponse, status_code=status.HTTP_201_CREATED)
async def create_team(
    team_data: TeamCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        team_repo = TeamRepository(db)
        hackathon_repo = HackathonRepository(db)
        registration_repo = HackathonRegistrationRepository(db)
        anketa_repo = AnketaRepository(db)
        
        hackathon = await hackathon_repo.get_by_id(team_data.hackathon_id)
        if not hackathon:
            raise HTTPException(status_code=404, detail="Хакатон не найден")
        
        anketa = await anketa_repo.get_by_user_id(current_user.id)
        if not anketa:
            raise HTTPException(status_code=400, detail="Сначала создай анкету")
        
        registration = await registration_repo.get_by_user_and_hackathon(
            current_user.id, team_data.hackathon_id
        )
        if not registration:
            raise HTTPException(
                status_code=400, 
                detail="Сначала зарегистрируйтесь на хакатон. Используйте POST /api/v1/hackathons/{hackathon_id}/register"
            )
        
        existing_team = await team_repo.get_by_user_and_hackathon(
            current_user.id, team_data.hackathon_id
        )
        if existing_team:
            raise HTTPException(status_code=400, detail="Уже в команде на этот хакатон")
        
        team = Team(
            id=uuid.uuid4(),
            name=team_data.name,
            id_hackathon=team_data.hackathon_id,
            id_capitan=current_user.id,
            max_size=team_data.max_size,
            status=team_data.status or "active",
            description=team_data.description,
            created_at=datetime.utcnow(),
            is_active=True
        )
        
        db.add(team)
        await db.flush()
        
        team_member = TeamMember(
            team_id=team.id,
            user_id=current_user.id,
            joined_at=datetime.utcnow()
        )
        
        db.add(team_member)
        
        await db.commit()
        
        await db.refresh(team)
        return TeamSimpleResponse.model_validate(team)
        
    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка создания команды: {str(e)}")

@router.get("/hackathon/{hackathon_id}", response_model=List[TeamResponse])
async def get_hackathon_teams(
    hackathon_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Получить все команды конкретного хакатона"""
    team_repo = TeamRepository(db)
    hackathon_repo = HackathonRepository(db)
    
    hackathon = await hackathon_repo.get_by_id(hackathon_id)
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Хакатон не найден"
        )
    
    teams = await team_repo.get_by_hackathon(hackathon_id, skip, limit)
    active_teams = [t for t in teams if t.is_active]
    return [TeamResponse.from_team(t) for t in active_teams]


@router.get("/my/current-hackathon", response_model=TeamResponse)
async def get_my_team_for_current_hackathon(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from repositories.hackathon_registration_repository import HackathonRegistrationRepository
    from presentations.schemas.team import TeamMemberResponse
    
    registration_repo = HackathonRegistrationRepository(db)
    team_repo = TeamRepository(db)
    hackathon_repo = HackathonRepository(db)
    anketa_repo = AnketaRepository(db)
    
    registrations = await registration_repo.get_by_user(current_user.id)
    if not registrations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Вы не зарегистрированы ни на один хакатон"
        )
    
    registrations.sort(key=lambda r: r.registered_at, reverse=True)
    latest_registration = registrations[0]
    
    hackathon = await hackathon_repo.get_by_id(latest_registration.hackathon_id)
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Хакатон не найден"
        )
    
    my_team = await team_repo.get_by_user_and_hackathon(current_user.id, latest_registration.hackathon_id)
    
    if not my_team or not my_team.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Вы не состоите в команде на этом хакатоне"
        )

    members_response = []
    for member in my_team.members:
        anketa = await anketa_repo.get_by_user_id(member.user_id)
        members_response.append(TeamMemberResponse.from_team_member(member, anketa))
    
    return TeamResponse(
        id=my_team.id,
        name=my_team.name,
        id_hackathon=my_team.id_hackathon,
        id_capitan=my_team.id_capitan,
        max_size=my_team.max_size,
        status=my_team.status,
        description=my_team.description,
        created_at=my_team.created_at,
        is_active=my_team.is_active,
        members=members_response
    )


@router.get("/my", response_model=List[TeamResponse])
async def get_my_teams(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    team_repo = TeamRepository(db)
    
    teams = await team_repo.get_user_teams(current_user.id)
    
    active_teams = [t for t in teams if t.is_active]
    
    return [TeamResponse.from_team(t) for t in active_teams]


@router.get("/{team_id}", response_model=TeamWithMembers)
async def get_team(
    team_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    team_repo = TeamRepository(db)
    team = await team_repo.get_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Команда не найдена"
        )
    
    # Загружаем участников с данными пользователей
    members = await team_repo.get_team_members(team_id)
    team.members = members
    
    return TeamWithMembers.from_team(team)


@router.delete("/{team_id}", status_code=status.HTTP_200_OK)
async def delete_team(
    team_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    team_repo = TeamRepository(db)
    team = await team_repo.get_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Команда не найдена")
    
    if not team.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Команда уже распущена"
        )

    if team.id_capitan == current_user.id:
        team.is_active = False
        team.deleted_at = datetime.now()
        team.deleted_by = current_user.id
        await db.commit()
        return {
            "message": "Team disbaned",
            "team_id": str(team_id),
            "deleted_at": datetime.utcnow().isoformat(),
            "can_restore": False
        }
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Ты не капитан этой команды")


@router.post("/{team_id}", status_code=status.HTTP_200_OK)
async def leave_team(
    team_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    team_repo = TeamRepository(db)

    team = await team_repo.get_by_id(team_id)
    if not team or not team.is_active:
        raise HTTPException(404, "Команда не найдена или распущена")
    
    is_member = await team_repo.is_user_in_team(team_id, current_user.id)
    if not is_member:
        raise HTTPException(400, "Вы не состоите в этой команде")
    
    response_data = {
        "message": "Вы покинули команду",
        "team_id": str(team_id),
        "team_name": team.name
    }
    
    if team.id_capitan == current_user.id:
        members = await team_repo.get_team_members(team_id)
        other_members = [m for m in members if m.user_id != current_user.id]
        
        if not other_members:
            team.is_active = False
            team.deleted_at = datetime.utcnow()
            response_data["team_status"] = "disbanded"
            response_data["message"] = "Вы покинули команду, команда распущена"
        else:
            new_captain = random.choice(other_members)
            team.id_capitan = new_captain.user_id
            
            new_captain_name = f"{new_captain.user.first_name} {new_captain.user.last_name or ''}".strip()
            response_data.update({
                "new_captain_id": str(new_captain.user_id),
                "new_captain_name": new_captain_name,
                "message": f"Вы покинули команду. Новый капитан: {new_captain_name}"
            })
    
    await team_repo.remove_member(team_id, current_user.id)
    
    remaining_members = await team_repo.get_team_members(team_id)
    if not remaining_members:
        team.is_active = False
        team.deleted_at = datetime.utcnow()
        response_data["team_status"] = "disbanded"
    
    await db.commit()
    return response_data


@router.delete("/{team_id}/members/{user_id}", status_code=status.HTTP_200_OK)
async def remove_from_team(
    team_id: UUID,
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
    ):

    team_repo = TeamRepository(db)

    team = await team_repo.get_by_id(team_id)

    if not team:
        raise HTTPException(404, detail="Команда не найдена")
    
    if not team.is_active:
        raise HTTPException(400, detail="Команда уже распущена")

    if not current_user.id == team.id_capitan:
        raise HTTPException(403, detail="Недостаточно прав, вы не капитан команды")

    if user_id == current_user.id:
        raise HTTPException(
            400, 
            detail="Нельзя исключить самого себя. Используйте /leave чтобы покинуть команду"
        )
    

    is_member_user = await team_repo.is_user_in_team(team_id, user_id)

    if is_member_user:
        await team_repo.remove_member(team_id, user_id)
    else:
        raise HTTPException(400, "Участник не состоит в вашей команде")
    
    return {
        "message": "Участник успешно исключен из команды",
        "team_id": str(team_id),
        "team_name": team.name,
        "removed_user_id": str(user_id),
        "removed_by": str(current_user.id),
        "timestamp": datetime.utcnow().isoformat()
    }
