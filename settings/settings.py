from loguru import logger
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class Postgres(BaseModel):
    database: str = "hackathon"
    host: str = "localhost"
    port: int = 5432
    username: str = "hackathon_user"
    password: str = "hackathon_pass"


class Uvicorn(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8000


class JWT(BaseModel):
    secret_key: str = "your-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080


class Telegram(BaseModel):
    bot_token: str = ""


class Settings(BaseSettings):
    pg: Postgres = Postgres()
    uvicorn: Uvicorn = Uvicorn()
    jwt: JWT = JWT()
    telegram: Telegram = Telegram()
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="HACKATHON_",
        env_nested_delimiter="__",
        case_sensitive=False
    )


settings = Settings()

if settings.uvicorn.host == "0.0.0.0":  # Простая проверка что настройки загрузились
    logger.info("✅ Settings loaded successfully")