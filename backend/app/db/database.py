from pathlib import Path

from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings
from app.db.base import Base


settings = get_settings()
Path(settings.sqlite_db_path_resolved).parent.mkdir(parents=True, exist_ok=True)
engine = create_engine(f"sqlite:///{settings.sqlite_db_path_resolved}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
GRIMORIO_TABLE_NAME = "grimorio_monstros"
LEGACY_MONSTER_TABLE_NAME = "monsters"


def ensure_grimorio_table() -> None:
    with engine.begin() as connection:
        tables = {
            row[0]
            for row in connection.execute(
                text("SELECT name FROM sqlite_master WHERE type = 'table'")
            ).fetchall()
        }
        if LEGACY_MONSTER_TABLE_NAME in tables and GRIMORIO_TABLE_NAME not in tables:
            connection.execute(text(f"ALTER TABLE {LEGACY_MONSTER_TABLE_NAME} RENAME TO {GRIMORIO_TABLE_NAME}"))


def ensure_grimorio_schema() -> None:
    required_columns = {
        "ability_elixir_cost": "INTEGER NOT NULL DEFAULT 1",
        "ability_limit_scope": "VARCHAR(20) NOT NULL DEFAULT 'turn'",
        "ability_limit_count": "INTEGER NOT NULL DEFAULT 1",
        "ability_target_mode": "VARCHAR(30) NOT NULL DEFAULT 'none'",
    }

    with engine.begin() as connection:
        existing_columns = {
            row[1]
            for row in connection.execute(text(f"PRAGMA table_info({GRIMORIO_TABLE_NAME})")).fetchall()
        }
        for column_name, definition in required_columns.items():
            if column_name in existing_columns:
                continue
            connection.execute(text(f"ALTER TABLE {GRIMORIO_TABLE_NAME} ADD COLUMN {column_name} {definition}"))


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def initialize_database() -> None:
    from app.db.seed import seed_monsters
    from app.models.battle_room import BattleRoomRecord  # noqa: F401
    from app.models.monster import Monster  # noqa: F401

    ensure_grimorio_table()
    Base.metadata.create_all(bind=engine)
    ensure_grimorio_schema()
    with SessionLocal() as session:
        seed_monsters(session)
