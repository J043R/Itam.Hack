from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError, ExpiredSignatureError
from passlib.context import CryptContext
from settings.settings import settings

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
    argon2__time_cost=3,           
    argon2__memory_cost=65536,     
    argon2__parallelism=4,         
    argon2__hash_len=32,          
    argon2__salt_len=16,          
)

def get_password_hash(password: str) -> str:
    """Получить хэш пароля используя Argon2"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверить пароль"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Создать JWT токен"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.jwt.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt.secret_key, algorithm=settings.jwt.algorithm)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Декодировать и проверить JWT токен"""
    try:
        payload = jwt.decode(token, settings.jwt.secret_key, algorithms=[settings.jwt.algorithm])
        return payload
    except ExpiredSignatureError:
        from loguru import logger
        logger.warning("JWT token expired")
        return None
    except JWTError as e:
        from loguru import logger
        logger.error(f"JWT error: {str(e)}")
        return None
    except JWTError as e:
        from loguru import logger
        logger.error(f"JWT decode error: {str(e)}")
        return None