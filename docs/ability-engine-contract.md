# Ability Engine Contract

## Purpose

This document is the canonical contract for designing and maintaining monster abilities in Southpaw.

It exists to keep the ruleset stable as the card pool grows, without turning the battle engine into a collection of fragile special cases.

## Current Model

Southpaw uses:

- metadata-driven ability constraints
- a centralized primitive-effect layer
- explicit battlefield state on each runtime card

This means the game supports rich abilities, but only inside a strict active-turn model.

## Supported Ability Metadata

Every monster may configure:

- `ability_elixir_cost`
- `ability_limit_scope`
- `ability_limit_count`
- `ability_target_mode`

These values are stored in the database and treated as part of the business contract, not just UI hints.

## Supported Target Modes

The engine currently supports:

- `none`
- `card`
- `player`
- `card_or_player`
- `ally_card`
- `two_cards`
- `up_to_two_cards`
- `all_cards`
- `all_enemy_cards`

Anything outside this list should be treated as unsupported until intentionally implemented end to end.

## Supported Primitive Effects

Abilities should be composed from reusable effects such as:

- direct card damage
- direct player damage
- direct card destruction
- self heal
- allied heal
- player heal
- immediate elixir gain
- immediate enemy elixir loss
- move to attack
- move to defense
- permanent self buff once per duel
- temporary stat modifier until end of acting turn
- temporary stat modifier until end of the next turn when explicitly configured
- clone summon
- all-cards damage
- all-enemy-cards damage
- buff clearing
- attack-target protection stored as explicit card state

## Turn Interaction Rule

There is no interaction during the opponent turn.

This means Southpaw does not currently allow:

- interrupts
- counters
- trap windows
- reaction abilities
- hidden delayed triggers waiting for enemy actions

If an effect must persist, it needs to persist as explicit state on the card and be checked later by normal turn flow.

## Expiration Rule

Effects that say "this turn" expire at the end of the acting player's turn before the next player starts.

Effects that explicitly last until the end of the next turn must store that duration in card state instead of relying on reactive listeners.

This rule avoids ambiguous cross-turn behavior and keeps maintenance predictable.

## Out Of Scope Systems

Do not design new abilities around:

- deck top
- draw pile
- hand reveal
- search effects
- stack timing
- destruction replacement
- "the next time this happens" listeners

These systems are not part of the current battle engine.

## Design Checklist For New Cards

Before approving a new monster ability, confirm that it:

- resolves on the active player's turn
- fits one of the supported target modes
- can be expressed through existing primitive effects
- does not depend on hidden zones or delayed listeners
- can be balanced with cost, usage limit, position, or drawback

## Maintenance Principle

When a new mechanic is needed, prefer adding one reusable primitive and wiring cards to it, instead of adding one new hardcoded branch per monster.
