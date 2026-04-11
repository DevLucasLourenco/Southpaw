# Card Standard

## Goal

This document defines the structural standard that all Southpaw cards must follow, both in catalogue view and in live battle view.

## Shared card identity

Every card should preserve these base elements:

- dominant color accents from the monster palette
- premium frame presentation
- strong type hierarchy
- visible cost
- visible combat stats
- dedicated ability space
- level as the main visible progression marker

`level` is the current gameplay-facing progression value.

`rarity` is deferred for future productization and should not drive balance or visual hierarchy decisions right now.

## Catalogue card standard

The catalogue card is the showcase version:

- richer presentation
- larger art window
- expanded descriptive space
- decorative frame details

This version exists for browsing, collection feel, and monster presentation.

## Battle card standard

The battle card is the competitive version:

- compact portrait format
- shared template for field, hand, and compact previews
- fixed ratio close to `5:7`
- art window scaled to show more of the monster
- no uncontrolled stretching to fill entire columns
- information prioritized for quick decisions
- footprint close to a physical TCG card so the board remains visible without scroll

### Required zones

1. Top identity bar
   Includes type, name, level, and cost.

2. Art frame
   Must prioritize the monster silhouette and reduce dead margins. The current duel template accepts tighter framing so the creature occupies more of the visible card area.

3. Stat line
   Displays HP, ATK, DEF, and AGI clearly.

4. Ability strip
   Shows ability name and a compact effect summary.

5. Action area
   Contains battle actions and must stay outside the art frame.

## Arena placement standard

- The board is the primary stage of the battle page.
- Personal panels should stay on the side so the table remains central.
- Secondary logs or room details should stay outside the main board.
- Card slots should remain visually consistent even when only one card is present.
- One summoned card must never enlarge enough to dominate the whole row.
- Slot layout should be based on fixed card bounds rather than oversized fluid blocks.
- All relevant duel information should remain visible without forcing vertical scroll on common desktop resolutions.
- The player hand should reuse the same battle-card family in a larger, more legible hand variant.
- The opponent hand should appear as facedown TCG-style cards with count visibility.
- Summoning should begin from the hand and resolve through a clear `ATK` / `DEF` decision step.

## Hand card standard

The hand card is the most readable version inside the duel:

- larger than the field card
- same TCG ratio as the battlefield template
- strong art presence for quick recognition
- enough width to display title, cost, stats, and ability header without crowding
- suitable for drag-and-drop interaction into the field

## Future creation checklist

When creating a new card, always define:

- slug
- name
- title
- attribute
- type
- level
- cost
- attack
- defense
- health
- agility
- ability name
- ability short text
- primary color
- secondary color
- image path

## UX rule

If a design choice makes the board less legible during play, prioritize gameplay readability over decorative detail.
