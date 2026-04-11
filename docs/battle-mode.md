# Battle Mode

## Objective

Southpaw includes a viable online PvP battle format for the web:

- 2 players per room
- unlimited spectators through the same room link
- shared live battlefield
- shared live hand-driven duel flow
- turn timer with increment
- elixir-based summoning and abilities

## Room model

- A room is created from the website through the `JOGAR AGORA` button.
- The room generates a shareable link.
- The first two users who join as players occupy the duel slots.
- Additional users may join as spectators.
- Live sockets stay in memory, while room snapshots are persisted in SQLite.

## Match rules

- Starting health: `8000`
- Starting elixir: `10`
- Starting hand size: `5`
- Elixir gain at the start of each turn: `+2`
- Card draw at the start of each new active turn after the opening setup: `+1`
- Elixir cap: none
- Field size: `5` cards
- Turn timer per player: `5 minutes`
- End-turn increment: `+10 seconds`
- Current draw source: shuffled full grimoire
- Current MVP note: there is no custom deckbuilding yet, but the flow already behaves like hand-based TCG play

## Turn structure

1. The active player receives elixir.
2. The active player draws `1` card, except during the initial opening setup that already gives each duelist `5`.
3. Cards already on the field become ready to act.
3. The player may:
   - drag a card from hand into the field
   - choose whether it enters in `attack` or `defense`
   - attack enemy monsters
   - attack directly if the enemy field is empty
   - use monster abilities
   - change card position
   - end the turn

## Combat rules

- A summoned card may attack immediately, except during turn 1 of the match.
- A player may continue summoning while enough elixir remains.
- When a player destroys an enemy card, they gain half of that card's elixir cost, rounded down.
- When one of your cards is destroyed by enemy action, you take damage equal to 10% of that card's maximum health.
- Only cards in attack position may attack.
- Cards in defense position reduce incoming combat through `DEF`.

## Ability rules

- Abilities resolve only on the acting player's turn.
- Abilities do not open interrupts or reaction windows on the opponent turn.
- Ability cost, usage limits, and target mode are driven by monster metadata.
- Temporary effects may expire at the end of the acting turn or at the end of the next turn when explicitly stored in card state.

## Battle card visual standard

All in-battle cards follow a tabletop-safe layout inspired by physical TCG play:

- portrait orientation only
- fixed card proportion around `5:7`
- full card fits inside the board slot without uncontrolled growth
- header band for identity and cost
- dedicated art window with contained image
- compact stat strip for HP, ATK, DEF, and AGI
- ability strip kept short and readable
- interaction buttons outside the art area

## UX and combat feedback

The arena is structured around clarity and speed:

- player identity and personal data on the side
- battlefield separation between top and bottom field
- visible hand for summoning
- facedown opponent hand strip with visible card count
- drag-and-drop summon flow with explicit `ATK` / `DEF` confirmation
- combat log panel
- highlight effects for source and target of actions
- summon animation
- destroy animation
- damage flash and shake feedback
- elixir spending animation
- larger table width and larger cards for better art readability
- typography and panel sizing tuned for desktop readability without forcing scroll

## Technical model

- Real-time sync: FastAPI WebSocket
- Match persistence: SQLite `battle_rooms`
- Card catalogue: SQLite-backed monster records
- Frontend: React arena bound to room state snapshots
- Viewer-aware serialization: each player sees only the own hand, while the opponent hand is exposed as count only

## Next recommended improvements

- reconnect and seat recovery tokens
- deck construction instead of shuffled full grimoire
- chat and emotes for spectators
- richer drag target UX for slot-specific summoning
- ranked matchmaking and persistence beyond room snapshots
