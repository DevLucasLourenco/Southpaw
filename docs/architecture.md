# Architecture

## Vision

Southpaw is being rebuilt as a full-stack card game platform instead of a single-process prototype. The current delivery focuses on a robust monster catalogue, a competitive battle table, and clean domain contracts that support future expansion without turning the ruleset into ad-hoc code.

## Architectural principles

- domain-first design inspired by explicit contracts
- thin API layer and isolated service layer
- SQLite for local persistence with an upgrade path
- React frontend as a typed client for versioned endpoints and live room state
- asset handling separated from records but linked through image paths
- battle rules expressed through reusable primitives whenever possible

## Monorepo layout

```text
backend/
  app/
    api/
    core/
    db/
    domain/
    models/
    schemas/
    services/
  data/
frontend/
  src/
    api/
    components/
    features/
    styles/
assets/
  monsters/
docs/
```

## Backend layers

### `models`

Contains SQLAlchemy entities that map to SQLite tables. `Monster` stores combat attributes, ability metadata, and visual metadata so the UI can render the card directly from database data.

### `services`

Contains business orchestration. The battle engine now centralizes room state, combat rules, timers, hand flow, draw flow, and ability resolution through reusable primitives instead of spreading card logic across multiple layers.

### `api`

FastAPI routes expose versioned endpoints and the live WebSocket battle channel. This keeps the frontend loosely coupled and leaves room for future clients.

## Frontend architecture

The frontend is a React + TypeScript application built around:

- a dedicated API client
- feature-level querying with TanStack Query
- reusable card and battlefield components
- reusable hand and battlefield components
- a live arena driven by room snapshots

The visual system treats the table as the primary stage:

- compact competitive field cards
- larger hand cards for drag-and-drop play
- a larger catalogue card for presentation
- color-driven accents from monster metadata
- responsive layout that prioritizes table readability over decorative excess

## Database strategy

SQLite is currently used for:

- the monster catalogue
- room snapshots in `battle_rooms`
- persisted player hand, draw pile, battlefield, graveyard, timer, and turn state inside each room snapshot
- early-stage gameplay persistence during local and MVP development

This keeps the project easy to run locally while preserving a clean upgrade path.

## Real-time duel state model

The current duel loop is hand-based:

- each player starts with `5` cards
- each new active turn draws `1` card
- the draw source is the shuffled full grimoire for now
- the frontend only exposes the local hand to the owning player
- the opponent hand is represented to the client by count rather than open card data during play

## Scalability path

When the game expands, the current structure supports:

- swapping SQLite for PostgreSQL with limited ORM churn
- adding Alembic migrations
- introducing authentication and admin dashboards
- persisting decks, players, matches, turns, and richer combat logs
- expanding the card pool without rewriting the battle contract
