from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from presentations.api.v1.dependencies import get_db
from presentations.schemas.user import (
    CodeLoginRequest, CodeLoginResponse, UserResponse
)
from presentations.schemas.admin import AdminLogin, AdminTokenResponse
from services.auth_service import AuthService
from services.login_code_service import LoginCodeService

router = APIRouter()


@router.post("/code", response_model=CodeLoginResponse)
async def auth_by_code(
    request: CodeLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    code_service = LoginCodeService(db)
    result = await code_service.verify_code(request.code)
    
    return CodeLoginResponse(
        access_token=result["access_token"],
        token_type=result["token_type"],
        user=UserResponse.model_validate(result["user"]),
        has_anketa=result["has_anketa"]
    )


@router.post("/admin/login", response_model=AdminTokenResponse)
async def admin_login(
    login_data: AdminLogin,
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthService(db)
    result = await auth_service.authenticate_admin(login_data.email, login_data.password)
    
    from presentations.schemas.admin import AdminResponse
    return AdminTokenResponse(
        access_token=result["access_token"],
        token_type=result["token_type"],
        admin=AdminResponse.model_validate(result["admin"])
    )

