from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from presentations.api.v1.dependencies import get_db
from persistent.db.models import User
from presentations.schemas.dev import TestUserCreate, TokenResponse
from presentations.api.dev.dependencies import dev_mode_only
from services.auth_service import create_access_token

router = APIRouter(
    prefix="/dev",
    tags=["development"],
    dependencies=[Depends(dev_mode_only)] 
)

@router.post(
    "/users",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
)
async def create_test_user(
    user_data: TestUserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Создание тестового пользователя.
    
    Только для разработки! В production возвращает 403.
    """
    # Проверяем, существует ли пользователь с таким телефоном
    existing_user = await db.execute(
        select(User).where(User.phone == user_data.phone)
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="User with this phone already exists"
        )
    
    # Создаем пользователя
    user = User(
        id=str(uuid.uuid4()),
        phone=user_data.phone,
        username=user_data.username or f"test_{uuid.uuid4().hex[:6]}",
        telegram_id=user_data.telegram_id or str(uuid.uuid4().int)[:9],
        is_active=user_data.is_active,
        is_admin=user_data.is_admin
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return {
        "message": "Test user created successfully",
        "user": {
            "id": user.id,
            "phone": user.phone,
            "username": user.username,
            "telegram_id": user.telegram_id
        }
    }