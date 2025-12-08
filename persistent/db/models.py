from sqlalchemy import (
    Column, Nullable, String, Boolean, DateTime, ForeignKey, Text,
    CheckConstraint, UniqueConstraint, Index, Integer
)
from persistent.db.base import Base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from uuid import uuid4


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, nullable=False)

    telegram_id = Column(String, nullable=False, unique=True, index=True)
    telegram_user_name = Column(String, nullable=True)
    telegram_hash = Column(String, nullable=False)

    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)

    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    anketa = relationship("UserAnketa", back_populates="user", uselist=False)
    achievements = relationship("UserAchievement", back_populates="user")
    hackathon_registrations = relationship("HackathonRegistration", back_populates="user")
    invitations_sent = relationship("Invitation", foreign_keys="Invitation.sender_id", back_populates="sender", overlaps="sender")
    invitations_received = relationship("Invitation", foreign_keys="Invitation.receiver_id", back_populates="receiver", overlaps="receiver")
    teams = relationship("TeamMember", back_populates="user")


class UserAnketa(Base):
    __tablename__ = "user_anketa"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)

    name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    contacts = Column(Text, nullable=False)
    university = Column(String, nullable=True)
    skills = Column(Text, nullable=True) 
    experience = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), nullable=False)

    user = relationship("User", back_populates="anketa")


class Hackathon(Base):
    __tablename__ = "hackathons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, nullable=False)

    name = Column(String, nullable=False, unique=True)
    describe = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)

    date_starts = Column(DateTime, nullable=False)
    date_end = Column(DateTime, nullable=False)
    register_start = Column(DateTime, nullable=False)
    register_end = Column(DateTime, nullable=False)

    created_at = Column(DateTime, default=func.now(), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("administrators.id"), nullable=True)

    teams = relationship("Team", back_populates="hackathon")
    achievements = relationship("UserAchievement", back_populates="hackathon")
    registrations = relationship("HackathonRegistration", back_populates="hackathon")

    __table_args__ = (
        CheckConstraint("date_end >= date_starts"),
        CheckConstraint("register_end >= register_start"),
    )


class Administrator(Base):
    __tablename__ = "administrators"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, nullable=False)

    email = Column(String, nullable=False, unique=True, index=True)
    password_hash = Column(String, nullable=False)

    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    permissions = Column(String, nullable=False)
    company = Column(String, nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), nullable=False)


class Team(Base):
    __tablename__ = "teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, nullable=False)

    name = Column(String, nullable=False)

    id_hackathon = Column(UUID(as_uuid=True), ForeignKey("hackathons.id"), nullable=False)
    id_capitan = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    max_size = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)


    is_active = Column(Boolean, default=True, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    deleted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    hackathon = relationship("Hackathon", back_populates="teams")
    members = relationship("TeamMember", back_populates="team")
    invitations = relationship("Invitation", back_populates="team")

    capitain = relationship("User", foreign_keys=[id_capitan])
    deleted_by_user = relationship("User", foreign_keys=[deleted_by])

    __table_args__ = (
        UniqueConstraint("name", "id_hackathon", name="uq_team_name_in_hackathon"),
        CheckConstraint("max_size > 0"),
        Index("idx_team_hackathon", "id_hackathon"),
    )


class TeamMember(Base):
    __tablename__ = "team_members"

    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"),
                     primary_key=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"),
                     primary_key=True, nullable=False)

    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="teams")

    __table_args__ = (
        UniqueConstraint("team_id", "user_id"),
    )


class UserAchievement(Base):
    __tablename__ = "user_achievement"

    hackathon_id = Column(UUID(as_uuid=True), ForeignKey("hackathons.id"),
                          primary_key=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"),
                     primary_key=True, nullable=False)

    result = Column(String, nullable=False)
    role = Column(String, nullable=False)

    hackathon = relationship("Hackathon", back_populates="achievements")
    user = relationship("User", back_populates="achievements")


class HackathonRegistration(Base):
    __tablename__ = "hackathon_registrations"

    hackathon_id = Column(UUID(as_uuid=True), ForeignKey("hackathons.id"),
                          primary_key=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"),
                     primary_key=True, nullable=False)

    registered_at = Column(DateTime, default=func.now(), nullable=False)

    hackathon = relationship("Hackathon", back_populates="registrations")
    user = relationship("User", back_populates="hackathon_registrations")

    __table_args__ = (
        UniqueConstraint("hackathon_id", "user_id", name="uq_unique_registration"),
    )


class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, nullable=False)

    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    receiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    invitation_type = Column(String, nullable=False)
    status = Column(String, nullable=False)

    created_at = Column(DateTime, default=func.now(), nullable=False)
    read_at = Column(DateTime, nullable=True)

    team = relationship("Team", back_populates="invitations")
    sender = relationship("User", foreign_keys=[sender_id], back_populates="invitations_sent", overlaps="invitations_sent")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="invitations_received", overlaps="invitations_received")

    __table_args__ = (
        UniqueConstraint("team_id", "receiver_id", name="uq_unique_invite_per_user_to_team"),
        CheckConstraint("sender_id != receiver_id"),
    )


class LoginCode(Base):
    __tablename__ = "login_codes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, nullable=False)
    
    code = Column(String, nullable=False, unique=True, index=True)
    telegram_id = Column(String, nullable=False, index=True)
    telegram_username = Column(String, nullable=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
    is_used = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    
    __table_args__ = (
        Index("idx_login_code_code", "code"),
        Index("idx_login_code_telegram_id", "telegram_id"),
    )

