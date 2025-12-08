from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
from infrastructure.db.connection import connection
from utils.security import decode_access_token
from persistent.db.models import User, Administrator
from repositories.user_repository import UserRepository
from repositories.admin_repository import AdminRepository

security = HTTPBearer()


async def get_db() -> AsyncSession: 
    async_session = connection()
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: Optional[str] = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format",
        )
    
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_uuid)
    
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    
    return user


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Administrator:
    from loguru import logger
    
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        logger.warning("Failed to decode admin token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. Please login again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    admin_id: Optional[str] = payload.get("sub")
    admin_type: Optional[str] = payload.get("type")
    
    logger.debug(f"Token payload: admin_id={admin_id}, type={admin_type}")
    
    if admin_id is None:
        logger.warning("Token missing admin_id (sub)")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing admin ID",
        )
    
    if admin_type != "admin":
        logger.warning(f"Token type mismatch: expected 'admin', got '{admin_type}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token type: expected 'admin', got '{admin_type}'. Please login as admin.",
        )
    
    try:
        admin_uuid = UUID(admin_id)
    except ValueError:
        logger.error(f"Invalid admin ID format: {admin_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin ID format",
        )
    
    admin_repo = AdminRepository(db)
    admin = await admin_repo.get_by_id(admin_uuid)
    
    if admin is None:
        logger.warning(f"Admin not found: {admin_uuid}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found",
        )
    
    if not admin.is_active:
        logger.warning(f"Admin account inactive: {admin_uuid}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin account is inactive",
        )
    
    return admin

