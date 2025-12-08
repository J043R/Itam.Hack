from datetime import datetime, timezone
from typing import Optional, TypeVar, Any, List
from uuid import UUID
from pydantic import BaseModel, validator, field_validator
import re

T = TypeVar('T')

def naive_datetime_validator(field_value: Any) -> Any:
    if isinstance(field_value, datetime) and field_value.tzinfo is not None:
        return field_value.astimezone(timezone.utc).replace(tzinfo=None)
    return field_value

class HackathonBase(BaseModel):
    name: str
    describe: Optional[str] = None
    image_url: Optional[str] = None
    date_starts: datetime
    date_end: datetime
    register_start: datetime
    register_end: datetime

    @validator('date_starts', 'date_end', 'register_start', 'register_end', pre=True)
    def validate_datetime_fields(cls, v):
        if isinstance(v, datetime):
            return naive_datetime_validator(v)
        if isinstance(v, str):
            date_pattern = r'(\d{4})-(\d{2})-(\d{3})'
            match = re.search(date_pattern, v)
            if match:
                year, month, day = match.groups()
                if len(day) == 3:
                    raise ValueError(
                        f"Invalid date format: '{v}'. "
                        f"Day has 3 digits '{day}' but should have 2 digits (01-31). "
                        f"Example: '{year}-{month}-{day[:2]}T...' instead of '{v[:10]}...'"
                    )
        return v
    
    @validator('date_starts', 'date_end', 'register_start', 'register_end')
    def normalize_datetime_fields(cls, v: datetime) -> datetime:
        """Нормализация datetime (удаление timezone)"""
        return naive_datetime_validator(v)


class HackathonCreate(HackathonBase):
    pass


class HackathonUpdate(BaseModel):
    name: Optional[str] = None
    describe: Optional[str] = None
    image_url: Optional[str] = None
    date_starts: Optional[datetime] = None
    date_end: Optional[datetime] = None
    register_start: Optional[datetime] = None
    register_end: Optional[datetime] = None

    @validator('date_starts', 'date_end', 'register_start', 'register_end')
    def validate_datetime_fields(cls, v: Optional[datetime]) -> Optional[datetime]:
        return naive_datetime_validator(v)


class HackathonResponse(HackathonBase):
    id: UUID
    created_at: datetime
    created_by: Optional[UUID] = None

    class Config:
        from_attributes = True


class HackathonParticipantInfo(BaseModel):
    user_id: UUID
    first_name: str
    last_name: Optional[str]
    telegram_username: Optional[str]
    role: Optional[str]
    university: Optional[str]
    team_name: Optional[str]
    is_captain: bool = False

    class Config:
        from_attributes = True


class HackathonInfoResponse(BaseModel):
    id: UUID
    name: str
    describe: Optional[str]
    date_starts: datetime
    date_end: datetime
    register_start: datetime
    register_end: datetime
    created_at: datetime
    total_participants: int
    total_teams: int
    participants: List[HackathonParticipantInfo]

    class Config:
        from_attributes = True