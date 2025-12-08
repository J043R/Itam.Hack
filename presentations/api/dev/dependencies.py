import os
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def dev_mode_only():
    """Защита dev-эндпоинтов только для разработки"""
    if os.getenv("ENVIRONMENT", "production") != "development":
        raise HTTPException(
            status_code=403, 
            detail="Dev endpoints are disabled in production"
        )
    return True

# Для дополнительной защиты можно добавить dev-токен
def dev_token_check(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Проверка dev-токена (опционально)"""
    dev_token = os.getenv("DEV_ACCESS_TOKEN")
    if dev_token and credentials.credentials != dev_token:
        raise HTTPException(status_code=401, detail="Invalid dev token")
    return True

