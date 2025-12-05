from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey, Text,
    CheckConstraint, UniqueConstraint, Index, Integer
)
from persistent.db.base import Base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from uuid import uuid4


# ============================================================
# USERS
# ============================================================
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
    invitations_sent = relationship("Invitation", foreign_keys="Invitation.sender_id")
    invitations_received = relationship("Invitation", foreign_keys="Invitation.receiver_id")
    teams = relationship("TeamMember", back_populates="user")


# ============================================================
# USER ANKETA
# ============================================================
class UserAnketa(Base):
    __tablename__ = "user_anketa"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)

    name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    contacts = Column(Text, nullable=False)
    skills = Column(Text, nullable=True)  # JSON string or comma-separated
    experience = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), nullable=False)

    user = relationship("User", back_populates="anketa")


# ============================================================
# HACKATHONS
# ============================================================
class Hackathon(Base):
    __tablename__ = "hackathons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, nullable=False)

    name = Column(String, nullable=False, unique=True)
    describe = Column(Text, nullable=True)

    date_starts = Column(DateTime, nullable=False)
    date_end = Column(DateTime, nullable=False)
    register_start = Column(DateTime, nullable=False)
    register_end = Column(DateTime, nullable=False)

    created_at = Column(DateTime, default=func.now(), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("administrators.id"), nullable=True)

    teams = relationship("Team", back_populates="hackathon")
    achievements = relationship("UserAchievement", back_populates="hackathon")

    __table_args__ = (
        CheckConstraint("date_end >= date_starts"),
        CheckConstraint("register_end >= register_start"),
    )


# ============================================================
# ADMINISTRATORS
# ============================================================
class Administrator(Base):
    __tablename__ = "administrators"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, nullable=False)

    email = Column(String, nullable=False, unique=True, index=True)
    password_hash = Column(String, nullable=False)

    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    permissions = Column(String, nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), nullable=False)


# ============================================================
# TEAMS
# ============================================================
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

    hackathon = relationship("Hackathon", back_populates="teams")
    members = relationship("TeamMember", back_populates="team")
    invitations = relationship("Invitation", back_populates="team")

    __table_args__ = (
        UniqueConstraint("name", "id_hackathon", name="uq_team_name_in_hackathon"),
        CheckConstraint("max_size > 0"),
        Index("idx_team_hackathon", "id_hackathon"),
    )


# ============================================================
# TEAM MEMBERS (M2M, composite PK)
# ============================================================
class TeamMember(Base):
    __tablename__ = "team_members"

    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"),
                     primary_key=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"),
                     primary_key=True, nullable=False)

    joined_at = Column(DateTime, default=func.now(), nullable=False)

    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="teams")

    __table_args__ = (
        UniqueConstraint("team_id", "user_id"),
    )


# ============================================================
# USER ACHIEVEMENTS (composite PK)
# ============================================================
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


# ============================================================
# INVITATIONS
# ============================================================
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
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

    __table_args__ = (
        UniqueConstraint("team_id", "receiver_id", name="uq_unique_invite_per_user_to_team"),
        CheckConstraint("sender_id != receiver_id"),
    )
