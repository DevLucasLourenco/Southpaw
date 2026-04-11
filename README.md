# Southpaw

Southpaw is a new card-battle project inspired by the domain ideas of the original Java prototype, but rebuilt from scratch as a modern full-stack application with Python, React, and SQLite.

The project focuses on:
- a scalable backend with clear domain contracts
- a modern React interface with premium card presentation
- a SQLite catalogue for monsters and image paths
- structured documentation for architecture, action plans, and next steps

## Chosen stack

- Backend: FastAPI, SQLAlchemy 2.0, Pydantic v2, Uvicorn
- Database: SQLite
- Frontend: React 18, TypeScript, Vite, TanStack Query
- Styling: CSS with design tokens and responsive layout
- Tooling: ESLint, TypeScript, Python virtual environment

Full stack rationale is documented in [docs/stack.md](/C:/Users/lucas/OneDrive/Documentos/Github%20Repo/Southpaw/docs/stack.md).

## Project structure

```text
Southpaw/
├── assets/
│   └── monsters/
├── backend/
│   ├── app/
│   └── data/
├── docs/
└── frontend/
```

## Monster assets

The game expects the following monster illustrations to exist in `assets/monsters/`:

- `Tharvok.png`
- `Velkryon.png`
- `Skhar.png`
- `Morvhal.png`

The backend seeds the database with these paths now, so you can drop the real images in later without changing the data model.

## Local development

### 1. Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -e .
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

### 3. Inicializacao conjunta

```powershell
.\start-all.ps1
```

Se quiser pular reinstalacao de dependencias quando ja estiver tudo preparado:

```powershell
.\start-all.ps1 -SkipInstall
```

### 4. App URLs

- API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Web app: `http://localhost:5173`

## SQLite

O projeto usa SQLite local e o arquivo do banco e criado automaticamente quando o backend sobe pela primeira vez.

- Caminho esperado: `backend/data/southpaw.db`
- Tabela principal do grimorio: `grimorio_monstros`
- Tabela de salas online: `battle_rooms`
- Seed inicial: `Tharvok`, `Velkryon`, `Skhar`, `Morvhal`
- Fonte oficial dos monstros: banco SQLite
- Migracao automatica da tabela legada: `monsters -> grimorio_monstros`
- Em bancos locais antigos, a tabela `monsters` pode permanecer apenas como legado; a aplicacao passa a ler e sincronizar `grimorio_monstros`

O que voce precisa fazer para ele aparecer:

1. Rodar o backend, manualmente ou com `.\start-all.ps1`
2. Esperar a aplicacao iniciar
3. Verificar a pasta `backend/data/`

Quando o FastAPI inicia, a aplicacao executa a inicializacao do banco e cria:

- o arquivo `southpaw.db`, se ele ainda nao existir
- a tabela `grimorio_monstros`
- a tabela `battle_rooms` para persistir salas e estados de batalha
- os registros iniciais com os caminhos das imagens

## Core endpoints

- `GET /health`
- `GET /api/v1/monsters`
- `GET /api/v1/monsters/{slug}`

## Battle rules

- Cards can enter the field in `attack` or `defense` position
- Each duelist starts with `5` cards in hand
- Each player draws `1` card at the start of each new active turn after the opening setup
- The current MVP uses the full grimoire as the draw source; deckbuilding will come later
- Only cards in `attack` position can attack
- Defense-position targets reduce incoming combat through their `DEF`
- Position change is treated as a regulated action in the turn flow
- Each monster ability has its own elixir cost
- Ability usage is configurable by scope and count, starting with `1x por turno`
- The engine already supports future extensions such as `1x por duelo`
- Ability resolution now uses a shared primitive engine instead of isolated card-only branches
- Temporary stat changes expire at the end of the acting player's turn
- There is no ability interaction during the opponent turn

### Current monster abilities

- `Tharvok`: `Frenesi da Brasa` costs `3` elixir, permanently gains `+50%` base ATK and drops current DEF to `0`; one use per duel
- `Drakoryn` (`velkryon` asset slug): `Coracao de Geodo` costs `3` elixir, doubles max HP and current HP once per duel, and cannot attack on the turn it is used
- `Skhar`: `Doppelganger` costs `2` elixir and creates a clone with `50%` of current stats; the clone is created without its own ability
- `Morvhal`: `Manto da Lua Morta` costs `1` elixir, cannot be targeted by attacks until the end of the next turn, and gains `+15%` ATK on the current turn

### Business rule notes

- Ability rules are metadata-driven by monster record fields such as cost, target mode, and usage limit
- Battle state tracks combat position, attack lock, attack-target protection, temporary stat modifiers, and per-turn/per-duel ability counters
- Room snapshots now persist `hand`, `draw_pile`, field, graveyard, timer, and viewer-specific hidden information
- Supported target modes are `none`, `card`, `player`, `card_or_player`, `ally_card`, `two_cards`, `up_to_two_cards`, `all_cards`, and `all_enemy_cards`
- Seed sync updates official monster records by `slug` while the SQLite database remains the runtime source of truth
- Tokens sao cartas temporarias de campo, nao pertencem ao Grimorio, nao entram no cemiterio e nao geram recompensa de destruicao
- O motor possui um construtor generico de token para suportar clones e futuras invocacoes especiais fora do Grimorio
- A arena atual usa uma faixa de mao inspirada em TCG, com arrastar-e-soltar para o campo e confirmacao de `ATK` ou `DEF`

## Documentation

- Architecture: [docs/architecture.md](/C:/Users/lucas/OneDrive/Documentos/Github%20Repo/Southpaw/docs/architecture.md)
- Stack and technologies: [docs/stack.md](/C:/Users/lucas/OneDrive/Documentos/Github%20Repo/Southpaw/docs/stack.md)
- Action plan and roadmap: [docs/action-plan.md](/C:/Users/lucas/OneDrive/Documentos/Github%20Repo/Southpaw/docs/action-plan.md)
- Online battle mode: [docs/battle-mode.md](/C:/Users/lucas/OneDrive/Documentos/Github%20Repo/Southpaw/docs/battle-mode.md)
- Card standard: [docs/card-standard.md](/C:/Users/lucas/OneDrive/Documentos/Github%20Repo/Southpaw/docs/card-standard.md)
- Ability system guide: [docs/ability-system.md](/C:/Users/lucas/OneDrive/Documentos/Github%20Repo/Southpaw/docs/ability-system.md)
- Current ability engine contract: [docs/ability-engine-contract.md](/C:/Users/lucas/OneDrive/Documentos/Github%20Repo/Southpaw/docs/ability-engine-contract.md)
- Monster creation prompt: [docs/monster-creation-prompt.md](/C:/Users/lucas/OneDrive/Documentos/Github%20Repo/Southpaw/docs/monster-creation-prompt.md)
- World lore: [docs/world-lore.md](/C:/Users/lucas/OneDrive/Documentos/Github%20Repo/Southpaw/docs/world-lore.md)
- Monster prototypes: [docs/monster-prototypes.md](/C:/Users/lucas/OneDrive/Documentos/Github%20Repo/Southpaw/docs/monster-prototypes.md)
