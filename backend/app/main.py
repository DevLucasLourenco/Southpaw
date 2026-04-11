from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes.health import router as health_router
from app.api.routes.battle import router as battle_router
from app.api.routes.monsters import router as monsters_router
from app.core.config import get_settings
from app.db.database import initialize_database
from app.services.battle_service import battle_manager


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    await battle_manager.start()
    try:
        yield
    finally:
        await battle_manager.stop()


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Southpaw backend API for monster catalogue and future battle systems.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"http://localhost:\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/assets", StaticFiles(directory=settings.assets_dir_resolved), name="assets")

app.include_router(health_router)
app.include_router(monsters_router, prefix=settings.api_v1_prefix)
app.include_router(battle_router, prefix=settings.api_v1_prefix)
