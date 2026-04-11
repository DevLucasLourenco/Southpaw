from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.monster import Monster


class MonsterService:
    def __init__(self, db: Session):
        self.db = db

    def list_monsters(self) -> list[Monster]:
        statement = select(Monster).order_by(Monster.rarity.desc(), Monster.name.asc())
        return list(self.db.scalars(statement).all())

    def get_monster_by_slug(self, slug: str) -> Monster | None:
        statement = select(Monster).where(Monster.slug == slug)
        return self.db.scalars(statement).first()

