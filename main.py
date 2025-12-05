from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import uvicorn

from settings.settings import settings
from presentations.api.v1.router import api_router

app = FastAPI(
    title="Hackathon Platform API",
    description="Platform for finding and forming teams for hackathons",
    version="1.0.0",
)

# CORS middleware для работы с фронтендом
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Hackathon Platform API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.uvicorn.host,
        port=settings.uvicorn.port,
        reload=True,
    )

