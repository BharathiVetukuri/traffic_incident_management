from fastapi import APIRouter

from app.api.routes import db_example, health


api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(db_example.router, prefix="/db", tags=["database"])
