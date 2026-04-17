from fastapi import APIRouter

from app.api.routes import db_example, health, incidents


api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(db_example.router, prefix="/db", tags=["database"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["incidents"])
