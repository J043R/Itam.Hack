from pydantic import BaseModel, Field
from typing import Optional

class TestUserCreate(BaseModel):
    phone: str = Field(..., example="+79991111111")
    username: Optional[str] = Field(None, example="test_user")
    telegram_id: Optional[str] = Field(None, example="123456789")
    is_active: bool = Field(True)
    is_admin: bool = Field(False)
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str