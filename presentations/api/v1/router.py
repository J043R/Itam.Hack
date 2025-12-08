from fastapi import APIRouter

from presentations.api.v1.endpoints import auth, anketa, hackathon, team, invitation, profile
from presentations.api.v1.endpoints.admin import hackathons as admin_hackathons, analytics, participants, settings, teams as admin_teams

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(anketa.router, prefix="/anketa", tags=["anketa"])
api_router.include_router(hackathon.router, prefix="/hackathons", tags=["hackathons"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(team.router, prefix="/teams", tags=["teams"])
api_router.include_router(invitation.router, prefix="/invitations", tags=["invitations"])

api_router.include_router(
    admin_hackathons.router,
    prefix="/admin/hackathons",
    tags=["admin-hackathons"]
)
api_router.include_router(
    analytics.router,
    prefix="/admin/analytics",
    tags=["admin-analytics"]
)
api_router.include_router(
    participants.router,
    prefix="/admin/participants",
    tags=["admin-participants"]
)
api_router.include_router(
    settings.router,
    prefix="/admin/settings",
    tags=["admin-settings"]
)
api_router.include_router(
    admin_teams.router,
    prefix="/admin/teams",
    tags=["admin-teams"]
)

