from datetime import timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from uuid import UUID
import json
import urllib.parse

from repositories.user_repository import UserRepository
from repositories.admin_repository import AdminRepository
from utils.security import create_access_token, verify_password
from utils.telegram_utils import verify_telegram_webapp_data, extract_user_data
from settings.settings import settings
from persistent.db.models import User, Administrator


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.admin_repo = AdminRepository(db)

    async def authenticate_telegram(self, init_data: str) -> dict:
        if not verify_telegram_webapp_data(init_data, settings.telegram.bot_token):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Telegram signature"
            )
        
        user_data = extract_user_data(init_data)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract user data from Telegram"
            )
        
        telegram_id = str(user_data.get("id"))
        telegram_username = user_data.get("username")
        first_name = user_data.get("first_name", "")
        last_name = user_data.get("last_name")
        
        photos = user_data.get("photo_url")
        avatar_url = photos if photos else None
        
        user = await self.user_repo.create_or_update_from_telegram(
            telegram_id=telegram_id,
            telegram_username=telegram_username,
            telegram_hash=init_data, 
            first_name=first_name,
            last_name=last_name,
            avatar_url=avatar_url
        )
        
        access_token = create_access_token(
            data={"sub": str(user.id), "type": "user"}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }

    async def authenticate_admin(self, email: str, password: str) -> dict:
        admin = await self.admin_repo.get_by_email(email)
        if not admin or not admin.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not verify_password(password, admin.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        access_token = create_access_token(
            data={"sub": str(admin.id), "type": "admin"}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "admin": admin
        }

