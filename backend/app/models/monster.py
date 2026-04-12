from app.db.base import Base
from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column


class Monster(Base):
    __tablename__ = "grimorio_monstros"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    lore: Mapped[str] = mapped_column(Text, nullable=False)
    card_type: Mapped[str] = mapped_column(String(50), nullable=False)
    attribute: Mapped[str] = mapped_column(String(50), nullable=False)
    rarity: Mapped[int] = mapped_column(Integer, nullable=False)
    level: Mapped[int] = mapped_column(Integer, nullable=False)
    attack: Mapped[int] = mapped_column(Integer, nullable=False)
    defense: Mapped[int] = mapped_column(Integer, nullable=False)
    health: Mapped[int] = mapped_column(Integer, nullable=False)
    mana_cost: Mapped[int] = mapped_column(Integer, nullable=False)
    primary_color: Mapped[str] = mapped_column(String(7), nullable=False)
    secondary_color: Mapped[str] = mapped_column(String(7), nullable=False)
    image_path: Mapped[str] = mapped_column(String(255), nullable=False)
    ability_name: Mapped[str] = mapped_column(String(120), nullable=False)
    ability_text: Mapped[str] = mapped_column(Text, nullable=False)
    ability_elixir_cost: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    ability_limit_scope: Mapped[str] = mapped_column(String(20), nullable=False, default="turn")
    ability_limit_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    ability_target_mode: Mapped[str] = mapped_column(String(30), nullable=False, default="none")

    def export_summary(self) -> dict:
        return {
            "slug": self.slug,
            "name": self.name,
            "title": self.title,
            "attribute": self.attribute,
            "mana_cost": self.mana_cost,
            "rarity": self.rarity,
            "ability_elixir_cost": self.ability_elixir_cost,
            "ability_limit_scope": self.ability_limit_scope,
            "ability_limit_count": self.ability_limit_count,
            "ability_target_mode": self.ability_target_mode,
        }
