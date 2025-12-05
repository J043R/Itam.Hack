from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from presentations.api.v1.dependencies import get_db
from presentations.schemas.user import TelegramAuthRequest, TelegramAuthResponse, UserResponse
from presentations.schemas.admin import AdminLogin, AdminTokenResponse
from services.auth_service import AuthService
from utils.security import create_access_token

router = APIRouter()


@router.post("/telegram", response_model=TelegramAuthResponse)
async def auth_telegram(
    request: TelegramAuthRequest,
    db: AsyncSession = Depends(get_db)
):
    """Аутентификация через Telegram"""
    auth_service = AuthService(db)
    result = await auth_service.authenticate_telegram(request.init_data)
    
    return TelegramAuthResponse(
        access_token=result["access_token"],
        token_type=result["token_type"],
        user=UserResponse.model_validate(result["user"])
    )


@router.post("/admin/login", response_model=AdminTokenResponse)
async def admin_login(
    login_data: AdminLogin,
    db: AsyncSession = Depends(get_db)
):
    """Вход администратора"""
    auth_service = AuthService(db)
    result = await auth_service.authenticate_admin(login_data.email, login_data.password)
    
    return AdminTokenResponse(
        access_token=result["access_token"],
        token_type=result["token_type"]
    )

