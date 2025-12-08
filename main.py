from calendar import c
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import uvicorn
import os
from datetime import datetime
from typing import Optional
from fastapi import Depends
import uuid  

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
import asyncio
from infrastructure.db.connection import create_all_tables

create_all_tables()
print("✅ Database tables created (if not exist)")

print(f"🔧 ENVIRONMENT = {os.getenv('ENVIRONMENT')}")

from settings.settings import settings
from presentations.api.v1.router import api_router
from contextlib import asynccontextmanager

from services.telegram_bot import start_telegram_bot, stop_telegram_bot


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting application...")
    try:
        asyncio.create_task(start_telegram_bot())
        logger.info("Telegram bot task started")
    except Exception as e:
        logger.error(f"Failed to start Telegram bot: {e}")
    
    yield
    
    logger.info("Shutting down application...")
    try:
        await stop_telegram_bot()
        logger.info("Telegram bot stopped")
    except Exception as e:
        logger.error(f"Error stopping Telegram bot: {e}")


app = FastAPI(
    title="Hackathon Platform API",
    description="Platform for finding and forming teams for hackathons",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")



@app.post("/api/dev/create-telegram-user", tags=["dev"])
async def create_telegram_user(
    telegram_id: str = "123456789",
    telegram_user_name: str = "test_user",
    first_name: str = "Test",
    last_name: str = "User"
):
    try:
        from persistent.db.models import User
        from utils.security import create_access_token
        
        DB_USER = "hackathon_user"
        DB_PASSWORD = "hackathon_pass" 
        DB_HOST = "postgres"
        DB_PORT = "5432"
        DB_NAME = "hackathon"
        
        DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        
        engine = create_async_engine(DATABASE_URL)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as session:
            result = await session.execute(
                select(User).where(User.telegram_id == telegram_id)
            )
            user = result.scalar_one_or_none()
            
            if not user:
                user = User(
                    id=uuid.uuid4(),
                    telegram_id=telegram_id,
                    telegram_user_name=telegram_user_name,
                    telegram_hash=f"dev_hash_{uuid.uuid4().hex[:10]}",
                    first_name=first_name,
                    last_name=last_name,
                    avatar_url=None,
                    is_active=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                session.add(user)
                await session.commit()
                await session.refresh(user)
                message = "Telegram user created"
            else:
                message = "Telegram user already exists"
            
            access_token = create_access_token(
                data={"sub": str(user.id), "type": "user"}
            )
            
            return {
                "message": message,
                "user": {
                    "id": str(user.id),
                    "telegram_id": user.telegram_id,
                    "telegram_user_name": user.telegram_user_name,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "is_active": user.is_active
                },
                "access_token": access_token,
                "token_type": "bearer"
            }
            
    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@app.post("/api/dev/get-token-for-telegram-user", tags=["dev"])
async def get_token_for_telegram_user(
    telegram_id: str = "123456789"
):
    try:
        from persistent.db.models import User
        from utils.security import create_access_token
        
        DB_USER = "hackathon_user"
        DB_PASSWORD = "hackathon_pass" 
        DB_HOST = "postgres"
        DB_PORT = "5432"
        DB_NAME = "hackathon"
        
        DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        
        engine = create_async_engine(DATABASE_URL)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as session:
            result = await session.execute(
                select(User).where(User.telegram_id == telegram_id)
            )
            user = result.scalar_one_or_none()
            
            if not user:
                return {
                    "error": f"User with telegram_id {telegram_id} not found",
                    "hint": "First create user via /api/dev/create-telegram-user"
                }
            
            access_token = create_access_token(
                data={"sub": str(user.id), "type": "user"}
            )
            
            return {
                "user": {
                    "id": str(user.id),
                    "telegram_id": user.telegram_id,
                    "telegram_user_name": user.telegram_user_name,
                    "first_name": user.first_name
                },
                "access_token": access_token,
                "token_type": "bearer"
            }
            
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/dev/create-admin", tags=["dev"])
async def create_admin_user(
    email: str = "admin@example.com",
    password: str = "admin123",
    full_name: str = "Admin User"
):
    try:
        from persistent.db.models import Administrator
        from utils.security import get_password_hash, create_access_token

        
        name_parts = full_name.strip().split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        DB_USER = "hackathon_user"
        DB_PASSWORD = "hackathon_pass" 
        DB_HOST = "postgres"
        DB_PORT = "5432"
        DB_NAME = "hackathon"
        
        DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        
        engine = create_async_engine(DATABASE_URL)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as session:
            result = await session.execute(
                select(Administrator).where(Administrator.email == email)
            )
            admin = result.scalar_one_or_none()
            
            if not admin:
                admin = Administrator(
                    id=uuid.uuid4(),
                    email=email,
                    password_hash=get_password_hash(password),
                    first_name=first_name,
                    last_name=last_name,
                    role="super_admin",  
                    permissions="all",   
                    is_active=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                session.add(admin)
                await session.commit()
                await session.refresh(admin)
                message = "Admin created"
            else:
                message = "Admin already exists"
            
            access_token = create_access_token(
                data={"sub": str(admin.id), "type": "admin"}  # type: "admin" вместо "user"
            )
            
            return {
                "message": message,
                "admin": {
                    "id": str(admin.id),
                    "email": admin.email,
                    "first_name": admin.first_name,
                    "last_name": admin.last_name,
                    "full_name": f"{admin.first_name} {admin.last_name}".strip(),
                    "role": admin.role,
                    "is_active": admin.is_active
                },
                "access_token": access_token,
                "token_type": "bearer",
                "login_credentials": {
                    "email": email,
                    "password": password
                }
            }
            
    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "traceback": traceback.format_exc(),
            "hint": "Check if Administrator model exists and has required fields"
        }


@app.get("/api/dev/check-admin-token", tags=["dev"])
async def check_admin_token(
    token: str
):
    try:
        from utils.security import decode_access_token
        from loguru import logger
        
        payload = decode_access_token(token)
        
        if payload is None:
            return {
                "valid": False,
                "error": "Token is invalid or expired",
                "hint": "Get a new token via /api/dev/create-admin or /api/dev/admin-login"
            }
        
        return {
            "valid": True,
            "payload": payload,
            "admin_id": payload.get("sub"),
            "type": payload.get("type"),
            "exp": payload.get("exp"),
            "expires_at": datetime.fromtimestamp(payload.get("exp")) if payload.get("exp") else None
        }
    except Exception as e:
        import traceback
        return {
            "valid": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }


@app.post("/api/dev/admin-login", tags=["dev"])
async def admin_login(
    email: str = "admin@example.com",
    password: str = "admin123"
):
    try:
        from persistent.db.models import Administrator
        from utils.security import verify_password, create_access_token
        
        DB_USER = "hackathon_user"
        DB_PASSWORD = "hackathon_pass" 
        DB_HOST = "postgres"
        DB_PORT = "5432"
        DB_NAME = "hackathon"
        
        DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        
        engine = create_async_engine(DATABASE_URL)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as session:
            result = await session.execute(
                select(Administrator).where(Administrator.email == email)
            )
            admin = result.scalar_one_or_none()
            
            if not admin:
                return {"error": "Admin not found"}
            
            if not admin.is_active:
                return {"error": "Admin account is inactive"}
            
            if not verify_password(password, admin.password_hash):
                return {"error": "Invalid password"}
            
            access_token = create_access_token(
                data={"sub": str(admin.id), "type": "admin"}
            )
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "admin": {
                    "id": str(admin.id),
                    "email": admin.email,
                    "first_name": admin.first_name,
                    "last_name": admin.last_name,
                    "full_name": f"{admin.first_name} {admin.last_name}".strip(),
                    "role": admin.role
                }
            }
            
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
async def root():
    return {"message": "Hackathon Platform API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.uvicorn.host,
        port=settings.uvicorn.port,
        reload=True,
    )

