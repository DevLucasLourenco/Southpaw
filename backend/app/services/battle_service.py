import asyncio
import contextlib
import random
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Literal

from fastapi import WebSocket
from sqlalchemy import select

from app.db.database import SessionLocal
from app.models.battle_room import BattleRoomRecord
from app.services.ability_engine import ABILITY_DEFINITIONS, AbilityContext
from app.services.monster_service import MonsterService

Seat = Literal["player_one", "player_two"]
Role = Literal["player", "spectator"]
RoomMode = Literal["pvp", "practice_bot"]
CardPosition = Literal["attack", "defense"]
MAX_FIELD_SIZE = 5
INITIAL_ELIXIR = 10
INITIAL_HEALTH = 8000
INITIAL_HAND_SIZE = 5
INITIAL_TIMER_MS = 5 * 60 * 1000
TURN_INCREMENT_MS = 10 * 1000
TURN_ELIXIR_GAIN = 2
SUPPORTED_TARGET_MODES = {
    "none",
    "card",
    "player",
    "card_or_player",
    "ally_card",
    "two_cards",
    "up_to_two_cards",
    "all_cards",
    "all_enemy_cards",
}


def _generate_room_id() -> str:
    return uuid.uuid4().hex[:8]


@dataclass
class MonsterTemplate:
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


@dataclass
class RuntimeCard:
    instance_id: str
    owner_seat: Seat
    slot_index: int
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
    max_health: int
    current_health: int
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
    base_attack: int
    base_defense: int
    base_max_health: int
    position: CardPosition = "attack"
    can_attack: bool = False
    can_use_ability: bool = False
    can_change_position: bool = False
    summoning_sickness: bool = True
    ability_used: bool = False
    ability_uses_this_turn: int = 0
    ability_uses_this_duel: int = 0
    cannot_attack_until_turn: int = 0
    attack_position_locked_until_turn: int = 0
    cannot_be_attack_target_until_turn: int = 0
    is_token: bool = False
    token_kind: str | None = None
    token_origin_slug: str | None = None
    effect_flags: dict[str, Any] = field(default_factory=dict)
    temporary_modifiers: list[dict[str, int | str]] = field(default_factory=list)

    def serialize(self) -> dict[str, Any]:
        return {
            "instance_id": self.instance_id,
            "owner_seat": self.owner_seat,
            "slot_index": self.slot_index,
            "slug": self.slug,
            "name": self.name,
            "title": self.title,
            "description": self.description,
            "lore": self.lore,
            "card_type": self.card_type,
            "attribute": self.attribute,
            "rarity": self.rarity,
            "level": self.level,
            "attack": self.attack,
            "defense": self.defense,
            "max_health": self.max_health,
            "current_health": self.current_health,
            "mana_cost": self.mana_cost,
            "primary_color": self.primary_color,
            "secondary_color": self.secondary_color,
            "image_path": self.image_path,
            "ability_name": self.ability_name,
            "ability_text": self.ability_text,
            "ability_elixir_cost": self.ability_elixir_cost,
            "ability_limit_scope": self.ability_limit_scope,
            "ability_limit_count": self.ability_limit_count,
            "ability_target_mode": self.ability_target_mode,
            "base_attack": self.base_attack,
            "base_defense": self.base_defense,
            "base_max_health": self.base_max_health,
            "position": self.position,
            "can_attack": self.can_attack,
            "can_use_ability": self.can_use_ability,
            "can_change_position": self.can_change_position,
            "ability_used": self.ability_used,
            "ability_uses_this_turn": self.ability_uses_this_turn,
            "ability_uses_this_duel": self.ability_uses_this_duel,
            "cannot_attack_until_turn": self.cannot_attack_until_turn,
            "attack_position_locked_until_turn": self.attack_position_locked_until_turn,
            "cannot_be_attack_target_until_turn": self.cannot_be_attack_target_until_turn,
            "is_token": self.is_token,
            "token_kind": self.token_kind,
            "token_origin_slug": self.token_origin_slug,
            "effect_flags": dict(self.effect_flags),
            "temporary_modifiers": [dict(modifier) for modifier in self.temporary_modifiers],
            "summoning_sickness": self.summoning_sickness,
        }

    @classmethod
    def from_state(cls, data: dict[str, Any]) -> "RuntimeCard":
        return cls(
            instance_id=data["instance_id"],
            owner_seat=data["owner_seat"],
            slot_index=data.get("slot_index", 0),
            slug=data["slug"],
            name=data["name"],
            title=data["title"],
            description=data["description"],
            lore=data["lore"],
            card_type=data["card_type"],
            attribute=data["attribute"],
            rarity=data["rarity"],
            level=data["level"],
            attack=data["attack"],
            defense=data["defense"],
            max_health=data["max_health"],
            current_health=data["current_health"],
            mana_cost=data["mana_cost"],
            primary_color=data["primary_color"],
            secondary_color=data["secondary_color"],
            image_path=data["image_path"],
            ability_name=data["ability_name"],
            ability_text=data["ability_text"],
            ability_elixir_cost=data.get("ability_elixir_cost", 1),
            ability_limit_scope=data.get("ability_limit_scope", "turn"),
            ability_limit_count=data.get("ability_limit_count", 1),
            ability_target_mode=data.get("ability_target_mode", "none"),
            base_attack=data.get("base_attack", data["attack"]),
            base_defense=data.get("base_defense", data["defense"]),
            base_max_health=data.get("base_max_health", data["max_health"]),
            position=data.get("position", "attack"),
            can_attack=data.get("can_attack", False),
            can_use_ability=data.get("can_use_ability", False),
            can_change_position=data.get("can_change_position", False),
            summoning_sickness=data.get("summoning_sickness", True),
            ability_used=data.get("ability_used", False),
            ability_uses_this_turn=data.get("ability_uses_this_turn", 0),
            ability_uses_this_duel=data.get("ability_uses_this_duel", 0),
            cannot_attack_until_turn=data.get("cannot_attack_until_turn", 0),
            attack_position_locked_until_turn=data.get("attack_position_locked_until_turn", 0),
            cannot_be_attack_target_until_turn=data.get("cannot_be_attack_target_until_turn", 0),
            is_token=data.get("is_token", False),
            token_kind=data.get("token_kind"),
            token_origin_slug=data.get("token_origin_slug"),
            effect_flags=dict(data.get("effect_flags", {})),
            temporary_modifiers=[dict(modifier) for modifier in data.get("temporary_modifiers", [])],
        )


@dataclass
class ParticipantState:
    seat: Seat
    display_name: str
    connected: bool = True
    health: int = INITIAL_HEALTH
    elixir: int = INITIAL_ELIXIR
    time_remaining_ms: int = INITIAL_TIMER_MS
    hand: list[str] = field(default_factory=list)
    draw_pile: list[str] = field(default_factory=list)
    battlefield: list[RuntimeCard] = field(default_factory=list)
    graveyard: list[str] = field(default_factory=list)

    def serialize(self) -> dict[str, Any]:
        return {
            "seat": self.seat,
            "display_name": self.display_name,
            "connected": self.connected,
            "health": self.health,
            "max_health": INITIAL_HEALTH,
            "elixir": self.elixir,
            "time_remaining_ms": self.time_remaining_ms,
            "hand": list(self.hand),
            "reserve": list(self.hand),
            "draw_pile": list(self.draw_pile),
            "draw_pile_count": len(self.draw_pile),
            "hand_count": len(self.hand),
            "battlefield": [card.serialize() for card in sorted(self.battlefield, key=lambda card: card.slot_index)],
            "graveyard": list(self.graveyard),
        }

    @classmethod
    def from_state(cls, data: dict[str, Any]) -> "ParticipantState":
        return cls(
            seat=data["seat"],
            display_name=data["display_name"],
            connected=data.get("connected", False),
            health=data.get("health", INITIAL_HEALTH),
            elixir=data.get("elixir", INITIAL_ELIXIR),
            time_remaining_ms=data.get("time_remaining_ms", INITIAL_TIMER_MS),
            hand=list(data.get("hand", data.get("reserve", []))),
            draw_pile=list(data.get("draw_pile", [])),
            battlefield=[RuntimeCard.from_state(card) for card in data.get("battlefield", [])],
            graveyard=list(data.get("graveyard", [])),
        )


@dataclass
class ConnectionState:
    connection_id: str
    websocket: WebSocket
    display_name: str
    role: Role
    seat: Seat | None


class BattleRoom:
    def __init__(
        self,
        room_id: str,
        templates: list[MonsterTemplate],
        state: dict[str, Any] | None = None,
        room_mode: RoomMode = "pvp",
    ):
        self.room_id = room_id
        self.room_mode: RoomMode = room_mode
        self.templates = {template.slug: template for template in templates}
        self.template_order = [template.slug for template in templates]
        self.connections: dict[str, ConnectionState] = {}
        self.players: dict[Seat, ParticipantState | None] = {"player_one": None, "player_two": None}
        self.started = False
        self.completed = False
        self.round_number = 1
        self.turn_number = 1
        self.active_seat: Seat | None = None
        self.winner_seat: Seat | None = None
        self.active_turn_started_at: float | None = None
        self.log: list[str] = []
        self.last_action: dict[str, Any] | None = None
        self.action_counter = 0

        if state:
            self._load_state(state)
        self.ensure_practice_bot()

    def _load_state(self, state: dict[str, Any]) -> None:
        self.room_mode = state.get("room_mode", self.room_mode)
        self.started = state.get("started", False)
        self.completed = state.get("completed", False)
        self.round_number = state.get("round_number", 1)
        self.turn_number = state.get("turn_number", 1)
        self.active_seat = state.get("active_seat")
        self.winner_seat = state.get("winner_seat")
        self.log = list(state.get("log", []))
        self.last_action = state.get("last_action")
        self.action_counter = state.get("action_counter", self.last_action.get("id", 0) if self.last_action else 0)
        self.active_turn_started_at = time.monotonic() if self.started and not self.completed and self.active_seat else None

        players = state.get("players", {})
        for seat in ("player_one", "player_two"):
            participant_state = players.get(seat)
            if participant_state:
                participant = ParticipantState.from_state(participant_state)
                participant.connected = False
                self.players[seat] = participant

    def _build_shuffled_grimoire(self) -> list[str]:
        pile = list(self.template_order)
        random.shuffle(pile)
        return pile

    def _draw_from_grimoire(self, participant: ParticipantState, amount: int = 1) -> list[str]:
        drawn: list[str] = []
        for _ in range(amount):
            if not participant.draw_pile:
                break
            drawn.append(participant.draw_pile.pop(0))
        participant.hand.extend(drawn)
        return drawn

    def _reset_participant_collection(self, participant: ParticipantState) -> None:
        participant.health = INITIAL_HEALTH
        participant.elixir = INITIAL_ELIXIR
        participant.time_remaining_ms = INITIAL_TIMER_MS
        participant.battlefield = []
        participant.graveyard = []
        participant.hand = []
        participant.draw_pile = self._build_shuffled_grimoire()
        self._draw_from_grimoire(participant, INITIAL_HAND_SIZE)

    def _serialize_participant_for_view(
        self,
        seat: Seat,
        participant: ParticipantState | None,
        connection: ConnectionState | None,
    ) -> dict[str, Any] | None:
        if participant is None:
            return None
        payload = participant.serialize()
        if connection and connection.role == "player" and connection.seat != seat:
            payload["hand"] = []
        payload["hand_count"] = len(participant.hand)
        payload["draw_pile_count"] = len(participant.draw_pile)
        return payload

    def create_participant(self, seat: Seat, display_name: str) -> ParticipantState:
        participant = ParticipantState(seat=seat, display_name=display_name)
        self._reset_participant_collection(participant)
        return participant

    def is_practice_mode(self) -> bool:
        return self.room_mode == "practice_bot"

    def ensure_practice_bot(self) -> None:
        if not self.is_practice_mode():
            return
        if self.players["player_two"] is None:
            bot = self.create_participant("player_two", "Automato de Treino")
            bot.connected = True
            self.players["player_two"] = bot

    def available_or_reclaimable_seat(self) -> Seat | None:
        if self.is_practice_mode():
            participant = self.players["player_one"]
            if participant is None or not participant.connected:
                return "player_one"
            return None
        for seat in ("player_one", "player_two"):
            participant = self.players[seat]
            if participant is None or not participant.connected:
                return seat
        return None

    def assign_connection(self, display_name: str, preferred_role: Role) -> tuple[Role, Seat | None]:
        seat: Seat | None = None
        assigned_role: Role = preferred_role

        if preferred_role == "player":
            seat = self.available_or_reclaimable_seat()
            if seat is None:
                assigned_role = "spectator"
            else:
                participant = self.players[seat]
                if participant is None:
                    self.players[seat] = self.create_participant(seat, display_name)
                else:
                    participant.display_name = display_name
                    participant.connected = True
                assigned_role = "player"

        return assigned_role, seat

    def disconnect(self, connection: ConnectionState) -> None:
        if connection.seat:
            participant = self.players[connection.seat]
            if participant:
                participant.connected = False

    def spectators_count(self) -> int:
        return sum(1 for connection in self.connections.values() if connection.role == "spectator")

    def both_players_ready(self) -> bool:
        if self.is_practice_mode():
            return self.players["player_one"] is not None and self.players["player_two"] is not None
        return all(self.players[seat] is not None and self.players[seat].connected for seat in ("player_one", "player_two"))

    def start_match(self) -> None:
        self.started = True
        self.active_seat = "player_one"
        self.round_number = 1
        self.turn_number = 1
        for participant in self.players.values():
            if participant:
                self._reset_participant_collection(participant)
        self.start_turn("player_one", is_initial=True)
        self.add_log("A partida comecou. O Duelista 1 abre o duelo.")

    def add_log(self, entry: str) -> None:
        self.log.insert(0, entry)
        self.log = self.log[:14]

    def _set_last_action(self, action: dict[str, Any]) -> None:
        self.action_counter += 1
        action["id"] = self.action_counter
        self.last_action = action

    def get_opponent_seat(self, seat: Seat) -> Seat:
        return "player_two" if seat == "player_one" else "player_one"

    def _ability_limit_reached(self, card: RuntimeCard) -> bool:
        if card.ability_limit_scope == "duel":
            return card.ability_uses_this_duel >= card.ability_limit_count
        return card.ability_uses_this_turn >= card.ability_limit_count

    def _refresh_card_turn_state(self, card: RuntimeCard) -> None:
        if card.summoning_sickness:
            card.summoning_sickness = False
        card.ability_uses_this_turn = 0
        card.can_change_position = True
        card.can_attack = card.position == "attack" and self.turn_number > 1 and card.cannot_attack_until_turn < self.turn_number
        card.can_use_ability = not self._ability_limit_reached(card)

    def _mark_ability_use(self, card: RuntimeCard) -> None:
        card.ability_uses_this_turn += 1
        card.ability_uses_this_duel += 1
        card.ability_used = card.ability_limit_scope == "duel" and card.ability_uses_this_duel >= card.ability_limit_count
        card.can_use_ability = not self._ability_limit_reached(card)

    def _set_card_position(self, card: RuntimeCard, position: CardPosition, from_turn_change: bool = False) -> None:
        if position == "attack" and card.attack_position_locked_until_turn >= self.turn_number:
            raise ValueError("Esta carta nao pode entrar em modo de ataque neste turno.")
        card.position = position
        if position == "defense":
            card.can_attack = False
        elif not from_turn_change:
            card.can_attack = self.turn_number > 1 and card.cannot_attack_until_turn < self.turn_number

    def _resolve_attack_against_card(self, attacker: RuntimeCard, target: RuntimeCard) -> int:
        if target.position == "defense":
            damage = max(0, attacker.attack - target.defense)
        else:
            damage = attacker.attack
        target.current_health -= damage
        return damage

    @property
    def max_field_size(self) -> int:
        return MAX_FIELD_SIZE

    def iter_battlefield_cards(self) -> list[tuple[Seat, ParticipantState, RuntimeCard]]:
        entries: list[tuple[Seat, ParticipantState, RuntimeCard]] = []
        for seat, participant in self.players.items():
            if not participant:
                continue
            for card in participant.battlefield:
                entries.append((seat, participant, card))
        return entries

    def _heal_card(self, card: RuntimeCard, amount: int) -> None:
        card.current_health = min(card.max_health, card.current_health + amount)

    def _heal_player(self, seat: Seat, amount: int) -> None:
        participant = self.players[seat]
        if not participant:
            return
        participant.health = min(INITIAL_HEALTH, participant.health + amount)

    def _damage_card(self, card: RuntimeCard, amount: int) -> None:
        card.current_health -= amount

    def _revert_temporary_modifier(self, card: RuntimeCard, modifier: dict[str, int | str]) -> None:
        stat = modifier.get("stat")
        amount = int(modifier.get("amount", 0))
        if stat == "attack":
            card.attack -= amount
        elif stat == "defense":
            card.defense -= amount

    def _apply_temporary_stat_modifier(self, card: RuntimeCard, stat: str, amount: int, duration_turns: int = 0) -> None:
        if amount == 0:
            return
        if stat == "attack":
            card.attack += amount
        elif stat == "defense":
            card.defense += amount
        else:
            raise ValueError("Unsupported temporary stat.")
        card.temporary_modifiers.append(
            {
                "stat": stat,
                "amount": amount,
                "expires_on_turn": self.turn_number + max(0, duration_turns),
            }
        )

    def _clear_expired_modifiers(self, expires_on_turn: int) -> None:
        for _, _, card in self.iter_battlefield_cards():
            active_modifiers: list[dict[str, int | str]] = []
            for modifier in card.temporary_modifiers:
                if int(modifier.get("expires_on_turn", -1)) != expires_on_turn:
                    active_modifiers.append(modifier)
                    continue
                self._revert_temporary_modifier(card, modifier)
            card.temporary_modifiers = active_modifiers
            card.attack = max(0, card.attack)
            card.defense = max(0, card.defense)

    def _clear_card_buffs(self, card: RuntimeCard) -> None:
        for modifier in list(card.temporary_modifiers):
            self._revert_temporary_modifier(card, modifier)
        card.temporary_modifiers = []
        card.attack = card.base_attack
        card.defense = card.base_defense
        card.max_health = card.base_max_health
        card.current_health = min(card.current_health, card.max_health)
        card.effect_flags["tharvok_frenzy_dissipated"] = bool(card.effect_flags.get("tharvok_frenzy_applied"))
        card.effect_flags["geode_heart_dissipated"] = bool(card.effect_flags.get("geode_heart_applied"))

    def _find_card_any(self, instance_id: str) -> tuple[Seat, RuntimeCard] | None:
        for seat, participant in self.players.items():
            if not participant:
                continue
            for card in participant.battlefield:
                if card.instance_id == instance_id:
                    return seat, card
        return None

    def _require_target_card(self, seat: Seat, instance_id: str | None) -> RuntimeCard:
        if not instance_id:
            raise ValueError("Escolha uma carta alvo.")
        target = self._get_card(seat, instance_id)
        if not target:
            raise ValueError("Carta alvo nao encontrada.")
        return target

    def _require_target_card_any(self, instance_id: str | None) -> tuple[Seat, RuntimeCard]:
        if not instance_id:
            raise ValueError("Escolha uma carta alvo.")
        match = self._find_card_any(instance_id)
        if not match:
            raise ValueError("Carta alvo nao encontrada.")
        return match

    def _require_distinct_cards(
        self,
        target_ids: list[str],
        exact: int | None = None,
        minimum: int | None = None,
        maximum: int | None = None,
        seat: Seat | None = None,
    ) -> list[tuple[Seat, RuntimeCard]]:
        deduped = list(dict.fromkeys(target_ids))
        if exact is not None and len(deduped) != exact:
            raise ValueError(f"Escolha exatamente {exact} alvos.")
        if minimum is not None and len(deduped) < minimum:
            raise ValueError(f"Escolha ao menos {minimum} alvo(s).")
        if maximum is not None and len(deduped) > maximum:
            raise ValueError(f"Escolha no maximo {maximum} alvo(s).")

        resolved: list[tuple[Seat, RuntimeCard]] = []
        for target_id in deduped:
            owner_seat, card = self._require_target_card_any(target_id)
            if seat is not None and owner_seat != seat:
                raise ValueError("Um dos alvos nao pertence ao campo permitido.")
            resolved.append((owner_seat, card))
        return resolved

    def start_turn(self, seat: Seat, is_initial: bool = False) -> None:
        participant = self.players[seat]
        if not participant:
            return
        if not is_initial:
            participant.elixir += TURN_ELIXIR_GAIN
            drawn_cards = self._draw_from_grimoire(participant, 1)
            if drawn_cards:
                self.add_log(f"{participant.display_name} comprou 1 carta.")
        for card in participant.battlefield:
            self._refresh_card_turn_state(card)
        self.active_seat = seat
        self.active_turn_started_at = None if self.is_practice_mode() else time.monotonic()
        self._set_last_action(
            {
                "kind": "turn_start",
                "seat": seat,
                "damaged_seats": [],
                "damaged_card_ids": [],
                "destroyed_card_ids": [],
                "elixir_spent": 0,
                "elixir_spent_seat": None,
            }
        )

    def sync_clock(self) -> None:
        if self.is_practice_mode():
            return
        if self.completed or not self.started or not self.active_seat or self.active_turn_started_at is None:
            return

        elapsed_ms = int((time.monotonic() - self.active_turn_started_at) * 1000)
        if elapsed_ms <= 0:
            return

        participant = self.players[self.active_seat]
        if not participant:
            return

        participant.time_remaining_ms = max(0, participant.time_remaining_ms - elapsed_ms)
        self.active_turn_started_at = time.monotonic()

        if participant.time_remaining_ms == 0:
            self.finish_match(self.get_opponent_seat(self.active_seat), "Time expired.")

    def finish_match(self, winner_seat: Seat, reason: str) -> None:
        self.completed = True
        self.winner_seat = winner_seat
        self.active_turn_started_at = None
        self._set_last_action({"kind": "match_end", "winner_seat": winner_seat})
        winner = self.players[winner_seat]
        winner_name = winner.display_name if winner else winner_seat
        self.add_log(f"{winner_name} wins the match. {reason}")

    def to_dict(self, connection: ConnectionState | None = None) -> dict[str, Any]:
        self.sync_clock()
        return {
            "room_id": self.room_id,
            "mode": self.room_mode,
            "started": self.started,
            "completed": self.completed,
            "round_number": self.round_number,
            "turn_number": self.turn_number,
            "active_seat": self.active_seat,
            "winner_seat": self.winner_seat,
            "spectators": self.spectators_count(),
            "players": {
                seat: self._serialize_participant_for_view(seat, participant, connection)
                for seat, participant in self.players.items()
            },
            "last_action": self.last_action,
            "log": self.log,
            "viewer": {
                "connection_id": connection.connection_id if connection else None,
                "role": connection.role if connection else "spectator",
                "seat": connection.seat if connection else None,
                "display_name": connection.display_name if connection else None,
            },
            "rules": {
                "timed": not self.is_practice_mode(),
                "field_size": MAX_FIELD_SIZE,
                "turn_increment_ms": TURN_INCREMENT_MS,
                "initial_timer_ms": INITIAL_TIMER_MS,
                "turn_elixir_gain": TURN_ELIXIR_GAIN,
                "initial_elixir": INITIAL_ELIXIR,
            },
        }

    def snapshot_state(self) -> dict[str, Any]:
        self.sync_clock()
        return {
            "room_mode": self.room_mode,
            "started": self.started,
            "completed": self.completed,
            "round_number": self.round_number,
            "turn_number": self.turn_number,
            "active_seat": self.active_seat,
            "winner_seat": self.winner_seat,
            "players": {
                seat: participant.serialize() if participant else None
                for seat, participant in self.players.items()
            },
            "last_action": self.last_action,
            "log": list(self.log),
            "action_counter": self.action_counter,
        }

    def room_summary(self) -> dict[str, Any]:
        return {
            "room_id": self.room_id,
            "mode": self.room_mode,
            "started": self.started,
            "completed": self.completed,
            "round_number": self.round_number,
            "spectators": self.spectators_count(),
            "seats": [
                {
                    "seat": seat,
                    "display_name": participant.display_name if participant else None,
                    "connected": participant.connected if participant else False,
                }
                for seat, participant in self.players.items()
            ],
        }

    def _build_runtime_card(self, seat: Seat, slug: str, slot_index: int) -> RuntimeCard:
        template = self.templates[slug]
        return RuntimeCard(
            instance_id=uuid.uuid4().hex[:10],
            owner_seat=seat,
            slot_index=slot_index,
            slug=template.slug,
            name=template.name,
            title=template.title,
            description=template.description,
            lore=template.lore,
            card_type=template.card_type,
            attribute=template.attribute,
            rarity=template.rarity,
            level=template.level,
            attack=template.attack,
            defense=template.defense,
            max_health=template.health,
            current_health=template.health,
            mana_cost=template.mana_cost,
            primary_color=template.primary_color,
            secondary_color=template.secondary_color,
            image_path=template.image_path,
            ability_name=template.ability_name,
            ability_text=template.ability_text,
            ability_elixir_cost=template.ability_elixir_cost,
            ability_limit_scope=template.ability_limit_scope,
            ability_limit_count=template.ability_limit_count,
            ability_target_mode=template.ability_target_mode,
            base_attack=template.attack,
            base_defense=template.defense,
            base_max_health=template.health,
        )

    def _build_token_card(
        self,
        seat: Seat,
        *,
        name: str,
        title: str,
        description: str,
        lore: str,
        attack: int,
        defense: int,
        health: int,
        image_path: str,
        token_kind: str,
        slot_index: int,
        token_origin_slug: str | None = None,
        attribute: str = "Token",
        level: int = 1,
        position: CardPosition = "attack",
    ) -> RuntimeCard:
        card = RuntimeCard(
            instance_id=uuid.uuid4().hex[:10],
            owner_seat=seat,
            slot_index=slot_index,
            slug=f"token-{token_kind}-{uuid.uuid4().hex[:6]}",
            name=name,
            title=title,
            description=description,
            lore=lore,
            card_type="Token",
            attribute=attribute,
            rarity=0,
            level=max(1, level),
            attack=max(0, attack),
            defense=max(0, defense),
            max_health=max(1, health),
            current_health=max(1, health),
            mana_cost=0,
            primary_color="#F5F2EA",
            secondary_color="#D8D2C2",
            image_path=image_path,
            ability_name="Carta Token",
            ability_text="Nao pertence ao Grimorio e existe apenas enquanto permanecer em campo.",
            ability_elixir_cost=0,
            ability_limit_scope="duel",
            ability_limit_count=0,
            ability_target_mode="none",
            base_attack=max(0, attack),
            base_defense=max(0, defense),
            base_max_health=max(1, health),
            can_attack=False,
            can_use_ability=False,
            can_change_position=False,
            ability_used=True,
            ability_uses_this_turn=0,
            ability_uses_this_duel=0,
            is_token=True,
            token_kind=token_kind,
            token_origin_slug=token_origin_slug,
            effect_flags={"is_token": True},
        )
        self._set_card_position(card, position)
        card.can_attack = False
        return card

    def _get_card(self, seat: Seat, instance_id: str) -> RuntimeCard | None:
        participant = self.players[seat]
        if not participant:
            return None
        for card in participant.battlefield:
            if card.instance_id == instance_id:
                return card
        return None

    def _validate_slot_index(self, slot_index: int) -> None:
        if slot_index < 0 or slot_index >= MAX_FIELD_SIZE:
            raise ValueError("Escolha uma zona valida do campo.")

    def _find_card_in_slot(self, participant: ParticipantState, slot_index: int) -> RuntimeCard | None:
        for card in participant.battlefield:
            if card.slot_index == slot_index:
                return card
        return None

    def _find_first_open_slot(self, participant: ParticipantState) -> int | None:
        for slot_index in range(MAX_FIELD_SIZE):
            if self._find_card_in_slot(participant, slot_index) is None:
                return slot_index
        return None

    def _spawn_scaled_clone(
        self,
        participant: ParticipantState,
        card: RuntimeCard,
        scale: float,
        clone_title: str,
    ) -> RuntimeCard:
        slot_index = self._find_first_open_slot(participant)
        if slot_index is None:
            raise ValueError("Nao ha espaco livre no campo para invocar o token.")

        clone = self._build_token_card(
            card.owner_seat,
            name=card.name,
            title=f"Token - {clone_title}",
            description="Uma manifestacao temporaria gerada por efeito de carta.",
            lore=f"Eco invocado a partir de {card.name}.",
            attack=max(1, int(card.attack * scale)),
            defense=max(0, int(card.defense * scale)),
            health=max(1, int(card.current_health * scale)),
            image_path=card.image_path,
            token_kind="clone",
            slot_index=slot_index,
            token_origin_slug=card.slug,
            attribute=card.attribute,
            level=max(1, card.level),
            position=card.position,
        )
        clone.effect_flags["is_clone"] = True
        participant.battlefield.append(clone)
        return clone

    def _handle_destruction_rewards(self, defeated_seat: Seat, dead_cards: list[RuntimeCard], killer_seat: Seat) -> list[str]:
        killer = self.players[killer_seat]
        defeated_player = self.players[defeated_seat]
        damaged_seats: list[str] = []

        if not killer or not defeated_player:
            return damaged_seats

        for card in dead_cards:
            if card.is_token:
                continue
            killer.elixir += card.mana_cost // 2
            backlash_damage = int(card.max_health * 0.10)
            if backlash_damage > 0:
                self._deal_damage_to_player(defeated_seat, backlash_damage)
                damaged_seats.append(defeated_seat)
                self.add_log(
                    f"{defeated_player.display_name} lost {backlash_damage} life after {card.name} was destroyed."
                )
        return damaged_seats

    def _remove_dead(self, seat: Seat, killer_seat: Seat | None = None) -> tuple[list[RuntimeCard], list[str]]:
        participant = self.players[seat]
        if not participant:
            return [], []
        alive_cards: list[RuntimeCard] = []
        dead_cards: list[RuntimeCard] = []
        for card in participant.battlefield:
            if card.current_health > 0:
                alive_cards.append(card)
                continue
            if int(card.effect_flags.get("cannot_be_destroyed_until_turn", 0)) >= self.turn_number:
                card.current_health = 1
                alive_cards.append(card)
                continue
            dead_cards.append(card)
            if not card.is_token:
                participant.graveyard.append(card.slug)
            self.add_log(
                f"{participant.display_name}'s {'token ' if card.is_token else ''}{card.name} has been defeated."
            )
        participant.battlefield = alive_cards
        damaged_seats = self._handle_destruction_rewards(seat, dead_cards, killer_seat) if killer_seat else []
        return dead_cards, damaged_seats

    def _collect_destroyed_cards(self, killer_seat: Seat | None) -> dict[str, list[str]]:
        destroyed_card_ids: list[str] = []
        damaged_seats: list[str] = []
        for seat in ("player_one", "player_two"):
            dead_cards, damaged = self._remove_dead(seat, killer_seat=killer_seat if seat != killer_seat else None)
            destroyed_card_ids.extend(card.instance_id for card in dead_cards)
            damaged_seats.extend(damaged)
        return {
            "destroyed_card_ids": destroyed_card_ids,
            "damaged_seats": list(dict.fromkeys(damaged_seats)),
        }

    def _deal_damage_to_player(self, seat: Seat, amount: int) -> None:
        participant = self.players[seat]
        if not participant:
            return
        participant.health = max(0, participant.health - amount)
        if participant.health == 0:
            self.finish_match(self.get_opponent_seat(seat), "The opposing core was destroyed.")

    def end_turn(self, seat: Seat) -> None:
        if self.completed or not self.active_seat or seat != self.active_seat:
            raise ValueError("It is not your turn.")

        self.sync_clock()
        participant = self.players[seat]
        if not participant:
            raise ValueError("Player not found.")

        self._clear_expired_modifiers(self.turn_number)
        if self.is_practice_mode():
            self.turn_number += 1
            self.round_number += 1
            self.add_log(f"{participant.display_name} encerrou o turno de treino.")
            self.start_turn(seat)
            return

        participant.time_remaining_ms += TURN_INCREMENT_MS
        next_seat = self.get_opponent_seat(seat)
        if next_seat == "player_one":
            self.round_number += 1
        self.turn_number += 1
        self.add_log(f"{participant.display_name} ended the turn and gained +10s.")
        self.start_turn(next_seat)

    def summon(self, seat: Seat, slug: str, position: CardPosition = "attack", slot_index: int | None = None) -> None:
        self.sync_clock()
        if self.completed or seat != self.active_seat:
            raise ValueError("You cannot summon right now.")
        participant = self.players[seat]
        if not participant:
            raise ValueError("Player not found.")
        if slug not in participant.hand:
            raise ValueError("Esta carta nao esta na sua mao.")
        if participant.elixir < self.templates[slug].mana_cost:
            raise ValueError("Not enough elixir.")
        if len(participant.battlefield) >= MAX_FIELD_SIZE:
            raise ValueError("Your battlefield is full.")
        if slot_index is None:
            slot_index = self._find_first_open_slot(participant)
        if slot_index is None:
            raise ValueError("Seu campo esta cheio.")
        self._validate_slot_index(slot_index)
        if self._find_card_in_slot(participant, slot_index):
            raise ValueError("Essa zona do campo ja esta ocupada.")

        participant.elixir -= self.templates[slug].mana_cost
        participant.hand.remove(slug)
        card = self._build_runtime_card(seat, slug, slot_index)
        card.can_change_position = False
        self._set_card_position(card, position)
        card.can_attack = position == "attack" and self.turn_number > 1
        card.can_use_ability = not self._ability_limit_reached(card)
        participant.battlefield.append(card)
        self._set_last_action(
            {
                "kind": "summon",
                "seat": seat,
                "card_id": card.instance_id,
                "summoned_card_id": card.instance_id,
                "slot_index": slot_index,
                "position": position,
                "damaged_seats": [],
                "damaged_card_ids": [],
                "destroyed_card_ids": [],
                "elixir_spent": self.templates[slug].mana_cost,
                "elixir_spent_seat": seat,
            }
        )
        self.add_log(f"{participant.display_name} summoned {card.name} in zona {slot_index + 1} em {position}.")

    def practice_spawn_enemy_card(self, seat: Seat, slug: str, position: CardPosition, slot_index: int) -> None:
        self.sync_clock()
        if not self.is_practice_mode():
            raise ValueError("Esta acao so esta disponivel no modo treino.")
        if seat != "player_one":
            raise ValueError("Apenas o duelista de treino pode configurar o campo inimigo.")
        opponent = self.players["player_two"]
        if not opponent:
            raise ValueError("O robo de treino nao esta disponivel.")
        self._validate_slot_index(slot_index)
        if self._find_card_in_slot(opponent, slot_index):
            raise ValueError("Essa zona do campo inimigo ja esta ocupada.")
        if len(opponent.battlefield) >= MAX_FIELD_SIZE:
            raise ValueError("O campo inimigo ja esta cheio.")
        if slug not in self.templates:
            raise ValueError("Carta invalida para treino.")

        card = self._build_runtime_card("player_two", slug, slot_index)
        self._set_card_position(card, position)
        card.can_attack = False
        card.can_use_ability = False
        card.can_change_position = False
        opponent.battlefield.append(card)
        self._set_last_action(
            {
                "kind": "practice_spawn_enemy",
                "seat": seat,
                "card_id": card.instance_id,
                "summoned_card_id": card.instance_id,
                "slot_index": slot_index,
                "position": position,
                "damaged_seats": [],
                "damaged_card_ids": [],
                "destroyed_card_ids": [],
                "elixir_spent": 0,
                "elixir_spent_seat": None,
            }
        )
        self.add_log(f"Campo de treino: {card.name} foi posicionado na zona {slot_index + 1} do inimigo.")

    def practice_remove_enemy_card(self, seat: Seat, card_id: str) -> None:
        self.sync_clock()
        if not self.is_practice_mode():
            raise ValueError("Esta acao so esta disponivel no modo treino.")
        if seat != "player_one":
            raise ValueError("Apenas o duelista de treino pode editar o campo inimigo.")
        opponent = self.players["player_two"]
        if not opponent:
            raise ValueError("O robo de treino nao esta disponivel.")

        card = self._get_card("player_two", card_id)
        if not card:
            raise ValueError("Carta inimiga nao encontrada.")

        opponent.battlefield = [enemy_card for enemy_card in opponent.battlefield if enemy_card.instance_id != card_id]
        self._set_last_action(
            {
                "kind": "practice_remove_enemy",
                "seat": seat,
                "card_id": card_id,
                "target_id": card_id,
                "damaged_seats": [],
                "damaged_card_ids": [],
                "destroyed_card_ids": [card_id],
                "elixir_spent": 0,
                "elixir_spent_seat": None,
            }
        )
        self.add_log(f"Campo de treino: {card.name} foi removido do lado inimigo.")

    def attack(self, seat: Seat, attacker_id: str, target_type: str, target_id: str | None = None) -> None:
        self.sync_clock()
        if self.completed or seat != self.active_seat:
            raise ValueError("You cannot attack right now.")
        participant = self.players[seat]
        opponent_seat = self.get_opponent_seat(seat)
        opponent = self.players[opponent_seat]
        if not participant or not opponent:
            raise ValueError("Players are not ready.")

        attacker = self._get_card(seat, attacker_id)
        if not attacker:
            raise ValueError("Attacker not found.")
        if attacker.position != "attack":
            raise ValueError("Only cards in attack position can attack.")
        if not attacker.can_attack:
            raise ValueError("This card cannot attack right now.")

        attacker.can_attack = False

        if target_type == "player":
            if opponent.battlefield:
                raise ValueError("Direct attacks are only allowed when the opponent has no cards on the field.")
            self._deal_damage_to_player(opponent_seat, attacker.attack)
            self._set_last_action(
                {
                    "kind": "attack",
                    "attacker_id": attacker.instance_id,
                    "target_type": "player",
                    "target_seat": opponent_seat,
                    "damaged_seats": [opponent_seat],
                    "damaged_card_ids": [],
                    "destroyed_card_ids": [],
                    "elixir_spent": 0,
                    "elixir_spent_seat": None,
                }
            )
            self.add_log(f"{participant.display_name}'s {attacker.name} struck directly for {attacker.attack}.")
            return

        if not target_id:
            raise ValueError("A target card is required.")
        target = self._get_card(opponent_seat, target_id)
        if not target:
            raise ValueError("Target not found.")
        if target.cannot_be_attack_target_until_turn >= self.turn_number:
            raise ValueError("Esta carta nao pode ser alvo de ataques neste turno.")

        damage = self._resolve_attack_against_card(attacker, target)
        dead_cards, damaged_seats = self._remove_dead(opponent_seat, killer_seat=seat)
        self._set_last_action(
            {
                "kind": "attack",
                "attacker_id": attacker.instance_id,
                "target_type": "card",
                "target_id": target_id,
                "combat_position": target.position,
                "combat_damage": damage,
                "damaged_card_ids": [target_id],
                "destroyed_card_ids": [card.instance_id for card in dead_cards],
                "damaged_seats": damaged_seats,
                "elixir_spent": 0,
                "elixir_spent_seat": None,
            }
        )
        self.add_log(f"{attacker.name} attacked {target.name} in {target.position} position for {damage}.")

    def change_position(self, seat: Seat, card_id: str, position: CardPosition) -> None:
        self.sync_clock()
        if self.completed or seat != self.active_seat:
            raise ValueError("You cannot change positions right now.")

        card = self._get_card(seat, card_id)
        if not card:
            raise ValueError("Card not found.")
        if not card.can_change_position:
            raise ValueError("This card cannot change position right now.")
        if card.position == position:
            raise ValueError("This card is already in that position.")

        self._set_card_position(card, position)
        card.can_change_position = False
        card.can_attack = False
        self._set_last_action(
            {
                "kind": "position_change",
                "card_id": card.instance_id,
                "position": position,
                "damaged_seats": [],
                "damaged_card_ids": [],
                "destroyed_card_ids": [],
                "elixir_spent": 0,
                "elixir_spent_seat": None,
            }
        )
        self.add_log(f"{card.name} switched to {position} position.")

    def _normalize_target_ids(self, target_id: str | None, target_ids: list[str] | None) -> list[str]:
        normalized = list(target_ids or [])
        if target_id and target_id not in normalized:
            normalized.append(target_id)
        return normalized

    def _validate_ability_target_payload(
        self,
        card: RuntimeCard,
        target_type: str | None,
        target_id: str | None,
        target_ids: list[str],
    ) -> None:
        target_mode = card.ability_target_mode
        if target_mode not in SUPPORTED_TARGET_MODES:
            raise ValueError("Modo de alvo da habilidade nao suportado.")
        if target_mode == "none" and (target_id or target_ids or target_type):
            raise ValueError("Esta habilidade nao exige alvo.")
        if target_mode in {"card", "ally_card"} and not target_id:
            raise ValueError("Escolha uma carta alvo.")
        if target_mode == "player" and target_type not in {None, "player"}:
            raise ValueError("Esta habilidade so pode atingir o jogador adversario.")
        if target_mode == "card_or_player" and target_type not in {"card", "player"}:
            raise ValueError("Escolha uma carta ou o jogador adversario.")
        if target_mode in {"all_cards", "all_enemy_cards"} and (target_id or target_ids or target_type):
            raise ValueError("Esta habilidade resolve sem selecao manual de alvo.")
        if target_mode == "two_cards" and len(target_ids) != 2:
            raise ValueError("Escolha exatamente 2 cartas.")
        if target_mode == "up_to_two_cards" and not (1 <= len(target_ids) <= 2):
            raise ValueError("Escolha uma ou duas cartas.")

    def _resolve_card_ability(
        self,
        participant: ParticipantState,
        opponent_seat: Seat,
        card: RuntimeCard,
        target_id: str | None = None,
        target_type: str | None = None,
        target_ids: list[str] | None = None,
    ) -> dict[str, Any]:
        definition = ABILITY_DEFINITIONS.get(card.slug)
        if definition is None:
            raise ValueError("Ability not implemented.")
        if definition.target_mode != card.ability_target_mode:
            raise ValueError("A habilidade desta carta esta configurada de forma inconsistente.")

        normalized_target_ids = self._normalize_target_ids(target_id, target_ids)
        self._validate_ability_target_payload(card, target_type, target_id, normalized_target_ids)

        context = AbilityContext(
            room=self,
            seat=participant.seat,
            participant=participant,
            opponent_seat=opponent_seat,
            opponent=self.players[opponent_seat],
            card=card,
            target_type=target_type,
            target_id=target_id,
            target_ids=normalized_target_ids,
        )
        outcome = definition.resolve(context)
        outcome.update(self._collect_destroyed_cards(killer_seat=participant.seat))
        return outcome

    def use_ability(
        self,
        seat: Seat,
        card_id: str,
        target_id: str | None = None,
        target_type: str | None = None,
        target_ids: list[str] | None = None,
    ) -> None:
        self.sync_clock()
        if self.completed or seat != self.active_seat:
            raise ValueError("You cannot use abilities right now.")

        participant = self.players[seat]
        opponent_seat = self.get_opponent_seat(seat)
        opponent = self.players[opponent_seat]
        if not participant or not opponent:
            raise ValueError("Players are not ready.")

        card = self._get_card(seat, card_id)
        if not card:
            raise ValueError("Card not found.")
        if not card.can_use_ability or self._ability_limit_reached(card):
            raise ValueError("This ability is not available right now.")
        if participant.elixir < card.ability_elixir_cost:
            raise ValueError("Not enough elixir to use this ability.")

        participant.elixir -= card.ability_elixir_cost
        try:
            outcome = self._resolve_card_ability(participant, opponent_seat, card, target_id, target_type, target_ids)
        except Exception:
            participant.elixir += card.ability_elixir_cost
            raise
        self._mark_ability_use(card)
        self.add_log(f"{card.name} activated {card.ability_name}.")

        self._set_last_action(
            {
                "kind": "ability",
                "card_id": card.instance_id,
                "target_id": target_id,
                "target_ids": outcome.get("target_ids", []),
                "target_type": target_type,
                "damaged_seats": outcome.get("damaged_seats", []),
                "damaged_card_ids": outcome.get("damaged_card_ids", []),
                "destroyed_card_ids": outcome.get("destroyed_card_ids", []),
                "summoned_card_id": outcome.get("summoned_card_id"),
                "target_seat": outcome.get("target_seat"),
                "elixir_spent": card.ability_elixir_cost,
                "elixir_spent_seat": seat,
            }
        )

    def process_action(self, seat: Seat, action: dict[str, Any]) -> None:
        action_type = action.get("type")
        if action_type == "summon":
            self.summon(seat, action["slug"], action.get("position", "attack"), action.get("slot_index"))
        elif action_type == "practice_spawn_enemy":
            self.practice_spawn_enemy_card(seat, action["slug"], action.get("position", "attack"), action["slot_index"])
        elif action_type == "practice_remove_enemy":
            self.practice_remove_enemy_card(seat, action["card_id"])
        elif action_type == "attack":
            self.attack(seat, action["attacker_id"], action["target_type"], action.get("target_id"))
        elif action_type == "change_position":
            self.change_position(seat, action["card_id"], action["position"])
        elif action_type == "ability":
            self.use_ability(
                seat,
                action["card_id"],
                action.get("target_id"),
                action.get("target_type"),
                action.get("target_ids"),
            )
        elif action_type == "end_turn":
            self.end_turn(seat)
        else:
            raise ValueError("Unknown action.")


class BattleRoomManager:
    def __init__(self):
        self.rooms: dict[str, BattleRoom] = {}
        self._tick_task: asyncio.Task | None = None

    def _load_templates(self) -> list[MonsterTemplate]:
        with SessionLocal() as session:
            monsters = MonsterService(session).list_monsters()
        return [
            MonsterTemplate(
                slug=monster.slug,
                name=monster.name,
                title=monster.title,
                description=monster.description,
                lore=monster.lore,
                card_type=monster.card_type,
                attribute=monster.attribute,
                rarity=monster.rarity,
                level=monster.level,
                attack=monster.attack,
                defense=monster.defense,
                health=monster.health,
                mana_cost=monster.mana_cost,
                primary_color=monster.primary_color,
                secondary_color=monster.secondary_color,
                image_path=monster.image_path,
                ability_name=monster.ability_name,
                ability_text=monster.ability_text,
                ability_elixir_cost=monster.ability_elixir_cost,
                ability_limit_scope=monster.ability_limit_scope,
                ability_limit_count=monster.ability_limit_count,
                ability_target_mode=monster.ability_target_mode,
            )
            for monster in monsters
        ]

    def _load_record(self, room_id: str) -> BattleRoomRecord | None:
        with SessionLocal() as session:
            statement = select(BattleRoomRecord).where(BattleRoomRecord.room_id == room_id)
            return session.scalars(statement).first()

    def _save_room(self, room: BattleRoom) -> None:
        state = room.snapshot_state()
        with SessionLocal() as session:
            statement = select(BattleRoomRecord).where(BattleRoomRecord.room_id == room.room_id)
            record = session.scalars(statement).first()
            if record is None:
                record = BattleRoomRecord(room_id=room.room_id, state=state)
                session.add(record)
            else:
                record.state = state
            session.commit()

    def get_or_create_room(self, room_id: str) -> BattleRoom:
        room = self.rooms.get(room_id)
        if room:
            return room
        record = self._load_record(room_id)
        state = record.state if record else None
        room = BattleRoom(
            room_id=room_id,
            templates=self._load_templates(),
            state=state,
            room_mode=state.get("room_mode", "pvp") if state else "pvp",
        )
        self.rooms[room_id] = room
        if record is None:
            self._save_room(room)
        return room

    def create_room(self, mode: RoomMode = "pvp") -> BattleRoom:
        room_id = _generate_room_id()
        room = BattleRoom(room_id=room_id, templates=self._load_templates(), room_mode=mode)
        self.rooms[room_id] = room
        self._save_room(room)
        return room

    def get_room(self, room_id: str) -> BattleRoom | None:
        return self.rooms.get(room_id)

    async def start(self) -> None:
        if self._tick_task is None:
            self._tick_task = asyncio.create_task(self._tick_loop())

    async def stop(self) -> None:
        if self._tick_task:
            self._tick_task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await self._tick_task
            self._tick_task = None

    async def _tick_loop(self) -> None:
        while True:
            await asyncio.sleep(0.5)
            for room in list(self.rooms.values()):
                if room.started and not room.completed:
                    self._save_room(room)
                    await self.broadcast_state(room)

    async def connect(self, room_id: str, websocket: WebSocket, display_name: str, preferred_role: Role) -> ConnectionState:
        await websocket.accept()
        room = self.get_or_create_room(room_id)
        assigned_role, seat = room.assign_connection(display_name, preferred_role)
        connection = ConnectionState(
            connection_id=uuid.uuid4().hex[:12],
            websocket=websocket,
            display_name=display_name,
            role=assigned_role,
            seat=seat,
        )
        room.connections[connection.connection_id] = connection
        room.add_log(f"{display_name} joined as {assigned_role}.")
        if room.both_players_ready() and not room.started:
            room.start_match()
        self._save_room(room)
        await self.broadcast_state(room)
        return connection

    async def disconnect(self, room_id: str, connection_id: str) -> None:
        room = self.rooms.get(room_id)
        if not room:
            return
        connection = room.connections.pop(connection_id, None)
        if not connection:
            return
        room.disconnect(connection)
        room.add_log(f"{connection.display_name} left the room.")
        self._save_room(room)
        await self.broadcast_state(room)

    async def broadcast_state(self, room: BattleRoom) -> None:
        stale: list[ConnectionState] = []
        for connection_id, connection in room.connections.items():
            try:
                await connection.websocket.send_json({"type": "state", "payload": room.to_dict(connection)})
            except Exception:
                stale.append(connection)
        for connection in stale:
            room.connections.pop(connection.connection_id, None)
            room.disconnect(connection)
        if stale:
            self._save_room(room)

    async def send_error(self, connection: ConnectionState, message: str) -> None:
        await connection.websocket.send_json({"type": "error", "message": message})

    async def process_action(self, room_id: str, connection: ConnectionState, action: dict[str, Any]) -> None:
        room = self.rooms.get(room_id)
        if not room:
            await self.send_error(connection, "Room not found.")
            return
        if connection.role != "player" or not connection.seat:
            await self.send_error(connection, "Spectators cannot play.")
            return
        try:
            room.process_action(connection.seat, action)
        except ValueError as exc:
            await self.send_error(connection, str(exc))
            return
        self._save_room(room)
        await self.broadcast_state(room)
battle_manager = BattleRoomManager()
