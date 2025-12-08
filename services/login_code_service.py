import secrets
import string
from typing import Optional
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from repositories.login_code_repository import LoginCodeRepository
from repositories.user_repository import UserRepository
from repositories.anketa_repository import AnketaRepository
from persistent.db.models import LoginCode, User
from utils.security import create_access_token


class LoginCodeService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.code_repo = LoginCodeRepository(db)
        self.user_repo = UserRepository(db)
        self.code_length = 6
        self.code_expiry_minutes = 10 

    def generate_code(self) -> str:
        return ''.join(secrets.choice(string.digits) for _ in range(self.code_length))

    async def create_code(
        self,
        telegram_id: str,
        telegram_username: Optional[str] = None,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None
    ) -> str:

        code = self.generate_code()
        
        while await self.code_repo.get_by_code(code):
            code = self.generate_code()
        
        expires_at = datetime.utcnow() + timedelta(minutes=self.code_expiry_minutes)
        
        login_code = LoginCode(
            code=code,
            telegram_id=telegram_id,
            telegram_username=telegram_username,
            first_name=first_name,
            last_name=last_name,
            expires_at=expires_at,
            is_used=False
        )
        
        await self.code_repo.create(login_code)
        
        return code

    async def verify_code(self, code: str) -> dict:
        login_code = await self.code_repo.get_valid_code(code)
        
        if not login_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Неверный или истекший код"
            )
        
        telegram_id = login_code.telegram_id
        telegram_username = login_code.telegram_username
        first_name = login_code.first_name
        last_name = login_code.last_name
        
        await self.code_repo.mark_as_used(login_code.id, datetime.utcnow())
        
        user = await self.user_repo.get_by_telegram_id(telegram_id)
        
        if not user:
            user = User(
                telegram_id=telegram_id,
                telegram_user_name=telegram_username,
                telegram_hash="", 
                first_name=first_name or "",
                last_name=last_name
            )
            user = await self.user_repo.create(user)
        else:
            if telegram_username:
                user.telegram_user_name = telegram_username
            if first_name:
                user.first_name = first_name
            if last_name:
                user.last_name = last_name
            await self.db.commit()
            await self.db.refresh(user)
        
        access_token = create_access_token(
            data={"sub": str(user.id), "type": "user"}
        )
        
        anketa_repo = AnketaRepository(self.db)
        anketa = await anketa_repo.get_by_user_id(user.id)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user,
            "has_anketa": anketa is not None
        }

