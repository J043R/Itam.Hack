from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import uuid

from presentations.api.v1.dependencies import get_db, get_current_admin
from presentations.schemas.admin import AdminCreate, AdminResponse
from persistent.db.models import Administrator
from repositories.admin_repository import AdminRepository
from utils.security import get_password_hash

router = APIRouter()

SUPER_ADMIN_ROLE = "super_admin"


def is_super_admin(admin: Administrator) -> bool:
    """Проверка что админ — супер-админ"""
    return admin.role.lower() == SUPER_ADMIN_ROLE


def check_cannot_modify_super_admin(target_admin: Administrator, current_admin: Administrator):
    """Проверка что обычный админ не может изменять супер-админа"""
    if is_super_admin(target_admin) and not is_super_admin(current_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас недостаточно прав для изменения супер-админа"
        )


@router.get("", response_model=List[AdminResponse])
async def get_all_admins(
    skip: int = 0,
    limit: int = 100,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Получить список всех администраторов"""
    admin_repo = AdminRepository(db)
    admins = await admin_repo.get_all(skip=skip, limit=limit)
    return [AdminResponse.model_validate(a) for a in admins]


@router.get("/me", response_model=AdminResponse)
async def get_my_profile(
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Получить свой профиль администратора"""
    return AdminResponse.model_validate(current_admin)


@router.put("/me", response_model=AdminResponse)
async def update_my_profile(
    first_name: str = None,
    last_name: str = None,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Обновить свой профиль администратора (только имя и фамилию)"""
    if first_name is not None:
        current_admin.first_name = first_name
    if last_name is not None:
        current_admin.last_name = last_name
    
    current_admin.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(current_admin)
    
    return AdminResponse.model_validate(current_admin)


@router.post("", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
async def create_admin(
    admin_data: AdminCreate,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Создать нового администратора (любой админ может создавать обычных админов)"""
    # Обычный админ не может создать супер-админа
    if admin_data.role.lower() == SUPER_ADMIN_ROLE and not is_super_admin(current_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас недостаточно прав для создания супер-админа"
        )
    
    admin_repo = AdminRepository(db)
    
    # Проверяем, что email не занят
    existing = await admin_repo.get_by_email(admin_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Администратор с таким email уже существует"
        )
    
    # Создаём администратора
    new_admin = Administrator(
        id=uuid.uuid4(),
        email=admin_data.email,
        password_hash=get_password_hash(admin_data.password),
        first_name=admin_data.first_name,
        last_name=admin_data.last_name,
        role=admin_data.role,
        permissions=admin_data.permissions,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_admin)
    await db.commit()
    await db.refresh(new_admin)
    
    return AdminResponse.model_validate(new_admin)


@router.get("/{admin_id}", response_model=AdminResponse)
async def get_admin(
    admin_id: UUID,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Получить информацию об администраторе"""
    admin_repo = AdminRepository(db)
    admin = await admin_repo.get_by_id(admin_id)
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Администратор не найден"
        )
    
    return AdminResponse.model_validate(admin)


@router.patch("/{admin_id}/deactivate", response_model=AdminResponse)
async def deactivate_admin(
    admin_id: UUID,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Деактивировать администратора (обычный админ не может деактивировать супер-админа)"""
    admin_repo = AdminRepository(db)
    admin = await admin_repo.get_by_id(admin_id)
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Администратор не найден"
        )
    
    # Обычный админ не может деактивировать супер-админа
    check_cannot_modify_super_admin(admin, current_admin)
    
    # Нельзя деактивировать самого себя
    if admin.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя деактивировать самого себя"
        )
    
    admin.is_active = False
    admin.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(admin)
    
    return AdminResponse.model_validate(admin)


@router.patch("/{admin_id}/activate", response_model=AdminResponse)
async def activate_admin(
    admin_id: UUID,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Активировать администратора (обычный админ не может активировать супер-админа)"""
    admin_repo = AdminRepository(db)
    admin = await admin_repo.get_by_id(admin_id)
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Администратор не найден"
        )
    
    # Обычный админ не может активировать супер-админа
    check_cannot_modify_super_admin(admin, current_admin)
    
    admin.is_active = True
    admin.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(admin)
    
    return AdminResponse.model_validate(admin)


@router.delete("/{admin_id}", status_code=status.HTTP_200_OK)
async def delete_admin(
    admin_id: UUID,
    current_admin: Administrator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Удалить администратора (обычный админ не может удалить супер-админа)"""
    admin_repo = AdminRepository(db)
    admin = await admin_repo.get_by_id(admin_id)
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Администратор не найден"
        )
    
    # Обычный админ не может удалить супер-админа
    check_cannot_modify_super_admin(admin, current_admin)
    
    # Нельзя удалить самого себя
    if admin.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя удалить самого себя"
        )
    
    await db.delete(admin)
    await db.commit()
    
    return {
        "message": "Администратор удалён",
        "admin_id": str(admin_id),
        "email": admin.email
    }
