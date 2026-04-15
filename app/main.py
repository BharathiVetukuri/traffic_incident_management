import asyncio
import sys

from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings


# Psycopg async requires selector loop on Windows.
if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["root"])
def read_root() -> dict[str, str]:
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}
