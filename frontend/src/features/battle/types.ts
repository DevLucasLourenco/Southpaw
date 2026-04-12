export type ViewerState = {
  connection_id: string | null;
  role: "player" | "spectator";
  seat: "player_one" | "player_two" | null;
  display_name: string | null;
};

export type RuntimeBattleCard = {
  instance_id: string;
  owner_seat: "player_one" | "player_two";
  slot_index: number;
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
  max_health: number;
  current_health: number;
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
  base_attack: number;
  base_defense: number;
  base_max_health: number;
  position: "attack" | "defense";
  can_attack: boolean;
  can_use_ability: boolean;
  can_change_position: boolean;
  ability_used: boolean;
  ability_uses_this_turn: number;
  ability_uses_this_duel: number;
  cannot_attack_until_turn: number;
  attack_position_locked_until_turn: number;
  cannot_be_attack_target_until_turn: number;
  is_token: boolean;
  token_kind: string | null;
  token_origin_slug: string | null;
  effect_flags: Record<string, boolean>;
  summoning_sickness: boolean;
};

export type BattlePlayerState = {
  seat: "player_one" | "player_two";
  display_name: string;
  connected: boolean;
  health: number;
  max_health: number;
  elixir: number;
  time_remaining_ms: number;
  hand: string[];
  hand_count: number;
  draw_pile_count: number;
  battlefield: RuntimeBattleCard[];
  graveyard: string[];
};

export type BattleRoomState = {
  room_id: string;
  mode: "pvp" | "practice_bot";
  started: boolean;
  completed: boolean;
  round_number: number;
  turn_number: number;
  active_seat: "player_one" | "player_two" | null;
  winner_seat: "player_one" | "player_two" | null;
  spectators: number;
  players: {
    player_one: BattlePlayerState | null;
    player_two: BattlePlayerState | null;
  };
  last_action: {
    id?: number;
    kind: string;
    attacker_id?: string;
    target_id?: string;
    target_ids?: string[];
    target_type?: string;
    target_seat?: string;
    card_id?: string;
    summoned_card_id?: string;
    slot_index?: number;
    position?: "attack" | "defense";
    seat?: string;
    winner_seat?: string;
    damaged_seats?: string[];
    damaged_card_ids?: string[];
    destroyed_card_ids?: string[];
    elixir_spent?: number;
    elixir_spent_seat?: string | null;
  } | null;
  log: string[];
  viewer: ViewerState;
  rules: {
    timed: boolean;
    field_size: number;
    turn_increment_ms: number;
    initial_timer_ms: number;
    turn_elixir_gain: number;
    initial_elixir: number;
  };
};

export type CreateRoomResponse = {
  room_id: string;
  join_path: string;
};
