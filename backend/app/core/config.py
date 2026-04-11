from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    app_name: str = "Southpaw API"
    api_v1_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:5173"
    sqlite_db_path: str = str(BACKEND_DIR / "data" / "southpaw.db")
    assets_dir: str = str(PROJECT_ROOT / "assets")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def sqlite_db_path_resolved(self) -> str:
        candidate = Path(self.sqlite_db_path)
        if candidate.is_absolute():
            return str(candidate)
        if candidate.parts and candidate.parts[0].lower() == "backend":
            candidate = Path(*candidate.parts[1:])
        return str((BACKEND_DIR / candidate).resolve())

    @property
    def assets_dir_resolved(self) -> str:
        candidate = Path(self.assets_dir)
        if candidate.is_absolute():
            return str(candidate)
        if candidate.parts and candidate.parts[0].lower() == "assets":
            return str((PROJECT_ROOT / candidate).resolve())
        return str((PROJECT_ROOT / candidate).resolve())


@lru_cache
def get_settings() -> Settings:
    return Settings()
