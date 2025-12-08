from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
import csv
import io

from presentations.api.v1.dependencies import get_db, get_current_admin
from presentations.schemas.hackathon import HackathonCreate, HackathonUpdate, HackathonResponse
from persistent.db.models import Administrator, Hackathon
from repositories.hackathon_repository import HackathonRepository
from repositories.team_repository import TeamRepository
from repositories.user_repository import UserRepository
from repositories.anketa_repository import AnketaRepository

router = APIRouter()


@router.post("", response_model=HackathonResponse, status_code=status.HTTP_201_CREATED)
async def create_hackathon(
    hackathon_data: HackathonCreate,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Создать хакатон"""
    hackathon_repo = HackathonRepository(db)
    
    hackathon = Hackathon(
        name=hackathon_data.name,
        describe=hackathon_data.describe,
        date_starts=hackathon_data.date_starts,
        date_end=hackathon_data.date_end,
        register_start=hackathon_data.register_start,
        register_end=hackathon_data.register_end,
        created_by=current_admin.id
    )
    
    created = await hackathon_repo.create(hackathon)
    return HackathonResponse.model_validate(created)


@router.get("", response_model=List[HackathonResponse])
async def get_all_hackathons(
    skip: int = 0,
    limit: int = 100,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    hackathon_repo = HackathonRepository(db)
    hackathons = await hackathon_repo.get_all(skip, limit)
    return [HackathonResponse.model_validate(h) for h in hackathons]


@router.get("/{hackathon_id}", response_model=HackathonResponse)
async def get_hackathon(
    hackathon_id: UUID,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Получить хакатон по ID"""
    hackathon_repo = HackathonRepository(db)
    hackathon = await hackathon_repo.get_by_id(hackathon_id)
    
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )
    
    return HackathonResponse.model_validate(hackathon)


@router.put("/{hackathon_id}", response_model=HackathonResponse)
async def update_hackathon(
    hackathon_id: UUID,
    hackathon_data: HackathonUpdate,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    hackathon_repo = HackathonRepository(db)
    hackathon = await hackathon_repo.get_by_id(hackathon_id)
    
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )
    
    update_data = hackathon_data.model_dump(exclude_unset=True)
    updated = await hackathon_repo.update(hackathon_id, **update_data)
    return HackathonResponse.model_validate(updated)


@router.delete("/{hackathon_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hackathon(
    hackathon_id: UUID,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    hackathon_repo = HackathonRepository(db)
    deleted = await hackathon_repo.delete(hackathon_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )


@router.get("/{hackathon_id}/export")
async def export_hackathon_teams_csv(
    hackathon_id: UUID,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Экспорт состава команд хакатона в CSV (только для администраторов)"""
    hackathon_repo = HackathonRepository(db)
    team_repo = TeamRepository(db)
    user_repo = UserRepository(db)
    anketa_repo = AnketaRepository(db)
    
    # Получаем хакатон
    hackathon = await hackathon_repo.get_by_id(hackathon_id)
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Хакатон не найден"
        )
    
    # Получаем все команды хакатона
    teams = await team_repo.get_by_hackathon(hackathon_id, skip=0, limit=1000)
    active_teams = [t for t in teams if t.is_active]
    
    # Создаем CSV в памяти с разделителем ; для Excel
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    
    # Заголовки CSV
    writer.writerow([
        'Команда',
        'Капитан',
        'Участник',
        'Роль в команде',
        'Вуз',
        'Telegram',
        'Email/Контакты'
    ])
    
    # Заполняем данные
    for team in active_teams:
        members = await team_repo.get_team_members(team.id)
        
        captain_name = ""
        
        # Сначала находим капитана
        for member in members:
            user = await user_repo.get_by_id(member.user_id)
            if not user:
                continue
                
            if team.id_capitan == member.user_id:
                captain_name = f"{user.first_name} {user.last_name or ''}".strip()
                break
        
        # Записываем участников команды
        for member in members:
            user = await user_repo.get_by_id(member.user_id)
            if not user:
                continue
            
            anketa = await anketa_repo.get_by_user_id(member.user_id)
            is_captain = team.id_capitan == member.user_id
            
            # Определяем роль в команде
            role_in_team = "Капитан" if is_captain else "Участник"
            
            writer.writerow([
                team.name,
                captain_name if is_captain else "",
                f"{user.first_name} {user.last_name or ''}".strip(),
                role_in_team,
                anketa.university if anketa else "",
                user.telegram_user_name or "",
                anketa.contacts if anketa else ""
            ])
    
    # Получаем CSV строку
    csv_content = output.getvalue()
    output.close()
    
    # Формируем имя файла (убираем кириллицу для совместимости)
    safe_filename = "".join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in hackathon.name)
    safe_filename = safe_filename.replace(' ', '_')
    filename = f"hackathon_{safe_filename}_teams.csv"
    
    # Используем RFC 5987 для поддержки UTF-8 в имени файла
    # Если имя содержит только ASCII, используем простой формат
    if filename.encode('ascii', 'ignore').decode('ascii') == filename:
        content_disposition = f"attachment; filename={filename}"
    else:
        # Для кириллицы используем RFC 5987
        import urllib.parse
        encoded_filename = urllib.parse.quote(filename, safe='')
        content_disposition = f"attachment; filename*=UTF-8''{encoded_filename}"
    
    # Возвращаем CSV файл
    return Response(
        content=csv_content,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": content_disposition
        }
    )

