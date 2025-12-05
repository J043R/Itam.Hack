from fastapi import APIRouter

from presentations.api.v1.endpoints import auth, anketa, hackathon, team, invitation
from presentations.api.v1.endpoints.admin import hackathons as admin_hackathons, analytics, participants

api_router = APIRouter()

# User endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(anketa.router, prefix="/anketa", tags=["anketa"])
api_router.include_router(hackathon.router, prefix="/hackathons", tags=["hackathons"])
api_router.include_router(team.router, prefix="/teams", tags=["teams"])
api_router.include_router(invitation.router, prefix="/invitations", tags=["invitations"])

# Admin endpoints
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

