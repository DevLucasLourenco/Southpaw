from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Callable

if TYPE_CHECKING:
    from app.services.battle_service import BattleRoom, CardPosition, ParticipantState, RuntimeCard, Seat


Effect = Callable[["AbilityContext"], None]


@dataclass
class AbilityOutcome:
    damaged_seats: set[str] = field(default_factory=set)
    damaged_card_ids: set[str] = field(default_factory=set)
    destroyed_card_ids: set[str] = field(default_factory=set)
    summoned_card_id: str | None = None
    target_ids: list[str] = field(default_factory=list)
    target_seat: str | None = None

    def merge(self, payload: dict[str, object]) -> None:
        self.damaged_seats.update(payload.get("damaged_seats", []))  # type: ignore[arg-type]
        self.damaged_card_ids.update(payload.get("damaged_card_ids", []))  # type: ignore[arg-type]
        self.destroyed_card_ids.update(payload.get("destroyed_card_ids", []))  # type: ignore[arg-type]
        summoned_card_id = payload.get("summoned_card_id")
        if isinstance(summoned_card_id, str):
            self.summoned_card_id = summoned_card_id
        target_seat = payload.get("target_seat")
        if isinstance(target_seat, str):
            self.target_seat = target_seat

    def to_dict(self) -> dict[str, object]:
        return {
            "damaged_seats": list(self.damaged_seats),
            "damaged_card_ids": list(self.damaged_card_ids),
            "destroyed_card_ids": list(self.destroyed_card_ids),
            "summoned_card_id": self.summoned_card_id,
            "target_seat": self.target_seat,
            "target_ids": list(self.target_ids),
        }


@dataclass
class AbilityContext:
    room: "BattleRoom"
    seat: "Seat"
    participant: "ParticipantState"
    opponent_seat: "Seat"
    opponent: "ParticipantState"
    card: "RuntimeCard"
    target_type: str | None = None
    target_id: str | None = None
    target_ids: list[str] = field(default_factory=list)
    outcome: AbilityOutcome = field(default_factory=AbilityOutcome)

    def __post_init__(self) -> None:
        if not self.target_ids and self.target_id:
            self.target_ids = [self.target_id]

    def add_log(self, message: str) -> None:
        self.room.add_log(message)

    def require_enemy_card(self) -> "RuntimeCard":
        card = self.room._require_target_card(self.opponent_seat, self.target_id)
        self.outcome.target_ids = [card.instance_id]
        return card

    def require_ally_card(self) -> "RuntimeCard":
        card = self.room._require_target_card(self.seat, self.target_id)
        self.outcome.target_ids = [card.instance_id]
        return card

    def require_any_card(self) -> "RuntimeCard":
        owner_seat, card = self.room._require_target_card_any(self.target_id)
        self.outcome.target_ids = [card.instance_id]
        if owner_seat in (self.seat, self.opponent_seat):
            return card
        raise ValueError("Carta alvo invalida.")

    def require_enemy_card_or_player(self) -> tuple[str, "RuntimeCard | None", "Seat | None"]:
        if self.target_type == "player":
            self.outcome.target_seat = self.opponent_seat
            return "player", None, self.opponent_seat
        enemy_card = self.require_enemy_card()
        return "card", enemy_card, None

    def require_two_cards(self) -> tuple["RuntimeCard", "RuntimeCard"]:
        targets = self.room._require_distinct_cards(self.target_ids, exact=2)
        self.outcome.target_ids = [card.instance_id for _, card in targets]
        return targets[0][1], targets[1][1]

    def require_up_to_two_enemy_cards(self) -> list["RuntimeCard"]:
        targets = self.room._require_distinct_cards(self.target_ids, minimum=1, maximum=2, seat=self.opponent_seat)
        self.outcome.target_ids = [card.instance_id for _, card in targets]
        return [card for _, card in targets]


@dataclass(frozen=True)
class AbilityDefinition:
    slug: str
    target_mode: str
    effects: tuple[Effect, ...]

    def resolve(self, context: AbilityContext) -> dict[str, object]:
        for effect in self.effects:
            effect(context)
        return context.outcome.to_dict()


def _mark_target_card_damaged(context: AbilityContext, card: "RuntimeCard") -> None:
    context.outcome.damaged_card_ids.add(card.instance_id)


def self_buff_attack_percent_once(flag: str, percent: float) -> Effect:
    def effect(context: AbilityContext) -> None:
        if context.card.effect_flags.get(flag):
            raise ValueError("Esta habilidade ja foi aplicada neste duelo.")
        context.card.attack = max(0, int(context.card.base_attack * (1 + percent)))
        context.card.effect_flags[flag] = True

    return effect


def self_set_defense(value: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        context.card.defense = max(0, value)

    return effect


def self_double_health_once(flag: str) -> Effect:
    def effect(context: AbilityContext) -> None:
        if context.card.effect_flags.get(flag):
            raise ValueError("Esta habilidade ja foi aplicada neste duelo.")
        context.card.max_health *= 2
        context.card.current_health *= 2
        context.card.effect_flags[flag] = True

    return effect


def self_cannot_attack_this_turn() -> Effect:
    def effect(context: AbilityContext) -> None:
        context.card.cannot_attack_until_turn = max(context.card.cannot_attack_until_turn, context.room.turn_number)
        context.card.can_attack = False

    return effect


def self_move_to_position(position: "CardPosition") -> Effect:
    def effect(context: AbilityContext) -> None:
        context.room._set_card_position(context.card, position)

    return effect


def self_lock_attack_position_for_next_own_turn() -> Effect:
    def effect(context: AbilityContext) -> None:
        context.card.attack_position_locked_until_turn = max(
            context.card.attack_position_locked_until_turn,
            context.room.turn_number + 2,
        )
        context.card.can_change_position = False

    return effect


def self_heal(amount: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        context.room._heal_card(context.card, amount)

    return effect


def owner_heal(amount: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        context.room._heal_player(context.seat, amount)

    return effect


def self_gain_temporary_attack_percent(percent: float, duration_turns: int = 0) -> Effect:
    def effect(context: AbilityContext) -> None:
        amount = max(1, int(context.card.base_attack * percent))
        context.room._apply_temporary_stat_modifier(context.card, "attack", amount, duration_turns=duration_turns)

    return effect


def self_cannot_be_attack_target_until_turns(duration_turns: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        context.card.cannot_be_attack_target_until_turn = max(
            context.card.cannot_be_attack_target_until_turn,
            context.room.turn_number + duration_turns,
        )

    return effect


def summon_doppelganger(scale: float = 0.5) -> Effect:
    def effect(context: AbilityContext) -> None:
        if len(context.participant.battlefield) >= context.room.max_field_size:
            raise ValueError("Seu campo esta cheio para criar o Doppelganger.")
        clone = context.room._spawn_scaled_clone(context.participant, context.card, scale=scale, clone_title="Doppelganger")
        context.outcome.summoned_card_id = clone.instance_id

    return effect


def target_ally_heal_and_temp_defense(heal_amount: int, defense_bonus: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        target = context.require_ally_card()
        context.room._heal_card(target, heal_amount)
        context.room._apply_temporary_stat_modifier(target, "defense", defense_bonus)

    return effect


def target_enemy_or_player_damage(amount: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        target_kind, target_card, target_seat = context.require_enemy_card_or_player()
        if target_kind == "player" and target_seat:
            context.room._deal_damage_to_player(target_seat, amount)
            context.outcome.damaged_seats.add(target_seat)
            return
        if target_card is None:
            raise ValueError("Alvo invalido.")
        context.room._damage_card(target_card, amount)
        _mark_target_card_damaged(context, target_card)

    return effect


def target_enemy_set_position(position: "CardPosition") -> Effect:
    def effect(context: AbilityContext) -> None:
        target = context.require_enemy_card()
        context.room._set_card_position(target, position, from_turn_change=True)

    return effect


def target_enemy_set_position_if_card(position: "CardPosition") -> Effect:
    def effect(context: AbilityContext) -> None:
        if context.target_type == "player":
            return
        target = context.require_enemy_card()
        context.room._set_card_position(target, position, from_turn_change=True)

    return effect


def target_any_swap_positions() -> Effect:
    def effect(context: AbilityContext) -> None:
        first, second = context.require_two_cards()
        first_position = first.position
        second_position = second.position
        context.room._set_card_position(first, second_position, from_turn_change=True)
        context.room._set_card_position(second, first_position, from_turn_change=True)

    return effect


def gain_elixir_by_all_monsters(cap: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        total_monsters = sum(len(participant.battlefield) for participant in context.room.players.values() if participant)
        context.participant.elixir += min(cap, total_monsters)

    return effect


def gain_flat_elixir(amount: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        context.participant.elixir += amount

    return effect


def gain_extra_elixir_if(predicate: Callable[[AbilityContext], bool], amount: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        if predicate(context):
            context.participant.elixir += amount

    return effect


def target_enemy_force_defense_and_reduce_defense(amount: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        target = context.require_enemy_card()
        context.room._set_card_position(target, "defense", from_turn_change=True)
        context.room._apply_temporary_stat_modifier(target, "defense", -amount)

    return effect


def target_enemy_dispel_and_damage(amount: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        target = context.require_enemy_card()
        context.room._clear_card_buffs(target)
        context.room._damage_card(target, amount)
        _mark_target_card_damaged(context, target)

    return effect


def target_enemy_destroy_card() -> Effect:
    def effect(context: AbilityContext) -> None:
        target = context.require_enemy_card()
        context.room._damage_card(target, target.current_health)
        _mark_target_card_damaged(context, target)

    return effect


def target_any_set_to_one_hp_and_double_attack_next_turn() -> Effect:
    def effect(context: AbilityContext) -> None:
        owner_seat, target = context.room._require_target_card_any(context.target_id)
        context.outcome.target_ids = [target.instance_id]
        target.current_health = 1
        context.room._apply_temporary_stat_modifier(target, "attack", max(1, target.attack), duration_turns=1)
        _mark_target_card_damaged(context, target)

        if owner_seat == context.seat:
            target.effect_flags["cannot_be_destroyed_until_turn"] = max(
                int(target.effect_flags.get("cannot_be_destroyed_until_turn", 0)),
                context.room.turn_number,
            )
            return

        target.cannot_attack_until_turn = max(target.cannot_attack_until_turn, context.room.turn_number + 1)
        target.can_attack = False

    return effect


def self_defense_heal_and_temp_defense(heal_amount: int, defense_bonus: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        context.room._set_card_position(context.card, "defense")
        context.room._heal_card(context.card, heal_amount)
        context.room._apply_temporary_stat_modifier(context.card, "defense", defense_bonus)
        context.card.can_change_position = False

    return effect


def gain_elixir_if_any_card_in_defense(amount: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        if any(card.position == "defense" for _, participant, card in context.room.iter_battlefield_cards()):
            context.participant.elixir += amount

    return effect


def deal_damage_all_cards(amount: int, max_health_protected_above: int | None = None) -> Effect:
    def effect(context: AbilityContext) -> None:
        for _, _, target in context.room.iter_battlefield_cards():
            if max_health_protected_above is not None and target.current_health > max_health_protected_above:
                target.current_health = max(1, target.current_health - amount)
            else:
                context.room._damage_card(target, amount)
            context.outcome.damaged_card_ids.add(target.instance_id)

        context.outcome.merge(context.room._collect_destroyed_cards(killer_seat=None))

    return effect


def target_enemy_force_defense_and_reduce_attack(amount: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        target = context.require_enemy_card()
        context.room._set_card_position(target, "defense", from_turn_change=True)
        context.room._apply_temporary_stat_modifier(target, "attack", -amount)

    return effect


def target_enemy_conditional_damage_by_elixir(high_damage: int, low_damage: int, lose_elixir: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        target_kind, target_card, target_seat = context.require_enemy_card_or_player()
        participant_elixir = context.participant.elixir
        opponent_elixir = context.opponent.elixir
        if participant_elixir > opponent_elixir:
            damage = high_damage
        else:
            damage = low_damage
            context.opponent.elixir = max(0, context.opponent.elixir - lose_elixir)

        if target_kind == "player" and target_seat:
            context.room._deal_damage_to_player(target_seat, damage)
            context.outcome.damaged_seats.add(target_seat)
            return
        if target_card is None:
            raise ValueError("Alvo invalido.")
        context.room._damage_card(target_card, damage)
        _mark_target_card_damaged(context, target_card)

    return effect


def target_enemy_attack_only_damage_then_force_defense(amount: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        target = context.require_enemy_card()
        if target.position != "attack":
            raise ValueError("Esta habilidade exige um alvo em modo de ataque.")
        context.room._damage_card(target, amount)
        _mark_target_card_damaged(context, target)
        if target.current_health > 0:
            context.room._set_card_position(target, "defense", from_turn_change=True)

    return effect


def opponent_lose_elixir_from_player_field(divisor: int, minimum: int, maximum: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        amount = len(context.participant.battlefield) // divisor
        amount = max(minimum, min(maximum, amount))
        context.opponent.elixir = max(0, context.opponent.elixir - amount)
        context.outcome.damaged_seats.add(context.opponent_seat)

    return effect


def move_up_to_two_enemy_cards_to_defense_and_damage(amount: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        targets = context.require_up_to_two_enemy_cards()
        for target in targets:
            context.room._set_card_position(target, "defense", from_turn_change=True)
            context.room._damage_card(target, amount)
            _mark_target_card_damaged(context, target)

    return effect


def deal_damage_all_enemy_cards_and_heal_per_survivor(damage: int, heal_per_survivor: int) -> Effect:
    def effect(context: AbilityContext) -> None:
        survivors = 0
        for target in list(context.opponent.battlefield):
            context.room._damage_card(target, damage)
            _mark_target_card_damaged(context, target)
            if target.current_health > 0:
                survivors += 1
        context.room._heal_card(context.card, heal_per_survivor * survivors)

    return effect


def controls_other_arcane(context: AbilityContext) -> bool:
    return any(
        ally.instance_id != context.card.instance_id and ally.attribute == "Arcano"
        for ally in context.participant.battlefield
    )


ABILITY_DEFINITIONS: dict[str, AbilityDefinition] = {
    "tharvok": AbilityDefinition(
        slug="tharvok",
        target_mode="none",
        effects=(
            self_buff_attack_percent_once("tharvok_frenzy_applied", 0.5),
            self_set_defense(0),
        ),
    ),
    "velkryon": AbilityDefinition(
        slug="velkryon",
        target_mode="none",
        effects=(
            self_double_health_once("geode_heart_applied"),
            self_cannot_attack_this_turn(),
        ),
    ),
    "skhar": AbilityDefinition(
        slug="skhar",
        target_mode="none",
        effects=(summon_doppelganger(),),
    ),
    "morvhal": AbilityDefinition(
        slug="morvhal",
        target_mode="none",
        effects=(
            self_gain_temporary_attack_percent(0.15),
            self_cannot_be_attack_target_until_turns(1),
        ),
    ),
    "dragao-pistola": AbilityDefinition(
        slug="dragao-pistola",
        target_mode="card",
        effects=(
            target_enemy_destroy_card(),
            self_cannot_attack_this_turn(),
        ),
    ),
    "cartomante-do-fio-nulo": AbilityDefinition(
        slug="cartomante-do-fio-nulo",
        target_mode="none",
        effects=(gain_elixir_by_all_monsters(cap=6),),
    ),
    "midas-aureo": AbilityDefinition(
        slug="midas-aureo",
        target_mode="card",
        effects=(target_any_set_to_one_hp_and_double_attack_next_turn(),),
    ),
    "cervo-de-aurivau": AbilityDefinition(
        slug="cervo-de-aurivau",
        target_mode="ally_card",
        effects=(target_ally_heal_and_temp_defense(300, 400),),
    ),
    "irma-da-vela-oca": AbilityDefinition(
        slug="irma-da-vela-oca",
        target_mode="ally_card",
        effects=(
            owner_heal(500),
            target_ally_heal_and_temp_defense(400, 0),
        ),
    ),
    "feral-de-serelune": AbilityDefinition(
        slug="feral-de-serelune",
        target_mode="card_or_player",
        effects=(
            target_enemy_or_player_damage(400),
            target_enemy_set_position_if_card("attack"),
        ),
    ),
    "bobo-do-nono-rasgo": AbilityDefinition(
        slug="bobo-do-nono-rasgo",
        target_mode="two_cards",
        effects=(target_any_swap_positions(),),
    ),
    "corista-de-odris": AbilityDefinition(
        slug="corista-de-odris",
        target_mode="none",
        effects=(
            gain_flat_elixir(2),
            gain_extra_elixir_if(controls_other_arcane, 1),
        ),
    ),
    "mastim-da-forja-muda": AbilityDefinition(
        slug="mastim-da-forja-muda",
        target_mode="card",
        effects=(target_enemy_force_defense_and_reduce_defense(400),),
    ),
    "viuva-do-espelho-cego": AbilityDefinition(
        slug="viuva-do-espelho-cego",
        target_mode="card",
        effects=(target_enemy_dispel_and_damage(600),),
    ),
    "cavaleiro-do-veio-partido": AbilityDefinition(
        slug="cavaleiro-do-veio-partido",
        target_mode="none",
        effects=(self_defense_heal_and_temp_defense(700, 500),),
    ),
    "corvo-da-lapide-sem-nome": AbilityDefinition(
        slug="corvo-da-lapide-sem-nome",
        target_mode="none",
        effects=(
            gain_flat_elixir(1),
            gain_elixir_if_any_card_in_defense(1),
        ),
    ),
    "prior-do-fogo-afogado": AbilityDefinition(
        slug="prior-do-fogo-afogado",
        target_mode="all_cards",
        effects=(deal_damage_all_cards(500, max_health_protected_above=2500),),
    ),
    "rastejante-de-geodo": AbilityDefinition(
        slug="rastejante-de-geodo",
        target_mode="ally_card",
        effects=(target_ally_heal_and_temp_defense(300, 500),),
    ),
    "duquista-sem-face": AbilityDefinition(
        slug="duquista-sem-face",
        target_mode="card",
        effects=(target_enemy_force_defense_and_reduce_attack(500),),
    ),
    "astrarca-do-cimo-partido": AbilityDefinition(
        slug="astrarca-do-cimo-partido",
        target_mode="card_or_player",
        effects=(target_enemy_conditional_damage_by_elixir(900, 400, 1),),
    ),
    "canhoneiro-de-ferrum": AbilityDefinition(
        slug="canhoneiro-de-ferrum",
        target_mode="card",
        effects=(target_enemy_attack_only_damage_then_force_defense(700),),
    ),
    "guarda-luto-de-serelune": AbilityDefinition(
        slug="guarda-luto-de-serelune",
        target_mode="ally_card",
        effects=(
            self_move_to_position("defense"),
            target_ally_heal_and_temp_defense(700, 0),
        ),
    ),
    "abadesa-da-conta-partida": AbilityDefinition(
        slug="abadesa-da-conta-partida",
        target_mode="player",
        effects=(opponent_lose_elixir_from_player_field(2, 1, 3),),
    ),
    "arquiteto-do-selo-submerso": AbilityDefinition(
        slug="arquiteto-do-selo-submerso",
        target_mode="up_to_two_cards",
        effects=(move_up_to_two_enemy_cards_to_defense_and_damage(300),),
    ),
    "reina-do-coral-carbonico": AbilityDefinition(
        slug="reina-do-coral-carbonico",
        target_mode="all_enemy_cards",
        effects=(deal_damage_all_enemy_cards_and_heal_per_survivor(600, 300),),
    ),
}
