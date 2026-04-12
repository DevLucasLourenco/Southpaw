from pydantic import BaseModel, ConfigDict


class MonsterBase(BaseModel):
    slug: str
    name: str
    title: str
    description: str
    lore: str
    card_type: str
    attribute: str
    rarity: int
    level: int
    attack: int
    defense: int
    health: int
    mana_cost: int
    primary_color: str
    secondary_color: str
    image_path: str
    ability_name: str
    ability_text: str
    ability_elixir_cost: int
    ability_limit_scope: str
    ability_limit_count: int
    ability_target_mode: str


class MonsterSummary(MonsterBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class MonsterCatalogResponse(BaseModel):
    items: list[MonsterSummary]
    total: int
