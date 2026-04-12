export type Monster = {
  id: number;
  slug: string;
  name: string;
  title: string;
  description: string;
  lore: string;
  card_type: string;
  attribute: string;
  rarity: number;
  level: number;
  attack: number;
  defense: number;
  health: number;
  mana_cost: number;
  primary_color: string;
  secondary_color: string;
  image_path: string;
  ability_name: string;
  ability_text: string;
  ability_elixir_cost: number;
  ability_limit_scope: string;
  ability_limit_count: number;
  ability_target_mode: string;
};

export type MonsterCatalogResponse = {
  items: Monster[];
  total: number;
};
