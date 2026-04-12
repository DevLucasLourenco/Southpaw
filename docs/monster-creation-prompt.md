# Monster Creation Prompt

## Objective

Use this document as the default visual brief whenever a new Southpaw monster illustration is requested from an image AI.

The visual baseline comes from the founding art set stored in `assets/monsters`, but this guide avoids locking future creation to any specific monster name.

## Visual DNA Of Southpaw

Every new monster should feel like it belongs to the same universe and card line.

### Core pillars

- dark fantasy with ritual weight
- premium TCG illustration quality
- one clear monster as the focal subject
- painterly realism over cartoon rendering
- strong silhouette readable at card scale
- color identity that can drive the card frame details

### World mood

- ruined empires after divine collapse
- cursed orders and relic-bound warriors
- grave kingdoms, broken sanctuaries, furnace keeps, mineral abysses, blind courts
- power expressed as burden, vow, curse, ritual, relic protocol, or predatory instinct

### Composition rules

- portrait-oriented full art suitable for a card
- one main creature only
- medium shot or full-body shot preferred
- background supports the creature instead of competing with it
- readable anatomy, face, weapon, horns, wings, claws, or mantle silhouette

## Image size contract

The art must be created for the card art window, not for the full card frame.

- target aspect ratio: `1.08:1`
- ideal render size: `1200 x 1110 px`
- premium alternative: `1400 x 1295 px`
- minimum acceptable: `900 x 830 px`
- safe area: keep the monster's important silhouette inside an `8%` margin on every edge

For Midjourney:

- use `--ar 11:10` as the closest ratio
- compose the monster centered and fully readable inside the frame
- do not let the main silhouette depend on the outermost edges

### Material rules

- forged metal should look ancient, scarred, engraved, cracked, or heat-stressed
- bone should feel fossilized, split, polished, moon-burned, or sanctified
- cloth should feel ceremonial, torn, dust-heavy, or burned by ritual use
- magic should feel diegetic: embers, ash, mineral light, grave flame, smoke, shards, cursed ink, relic pulses

### Color rules

- choose one dominant color and one secondary support color
- the dominant color must be visible from far away
- the support color should live in eyes, runes, veins, gems, mist, smoke, or reflected light
- avoid rainbow palettes and modern neon overload

## Family Presets

### Infernal Vanguard

Use for front-line monsters tied to furnaces, war oaths, hot metal, ash, and brutal impact.

- blackened metal
- molten seams or ember vents
- aggressive forward posture
- heavy silhouette with explosive presence

### Stone Bastion

Use for guardians tied to geodes, mines, ancient seals, and mineral memory.

- enormous body mass
- cracked rock plates
- gold-lit fractures or mineral veins
- fortress-like silhouette

### Masquerade Of Delirium

Use for cursed performers, omen thieves, and mirrored deceivers.

- theatrical posture
- elegant cruelty
- masks, veils, ribbons, mirror shards, omen relics
- unstable smoke or dream-distortion accents

### Lunar Revenant

Use for hunters, specters, mourning beasts, and grave-born entities.

- moonlit bone, spectral fur, thin flame, pale silver or blue fire
- cemetery, ruin, mausoleum, tidal grave, or moon court atmosphere
- silent, predatory motion

## Prompt Master Template

```md
Create a premium dark-fantasy TCG monster illustration for Southpaw.

Monster name: [NAME]
Title: [TITLE]
Faction or origin: [FACTION_OR_REGION]
Role or battlefield identity: [ROLE]
Attribute: [ATTRIBUTE]
Primary color: [PRIMARY_COLOR]
Secondary color: [SECONDARY_COLOR]
Target art size: 1200 x 1110 px
Target aspect ratio: 1.08:1
Midjourney ratio: --ar 11:10
Safe area: keep the monster silhouette inside an 8% inner margin

Visual concept:
[2 to 4 sentences describing anatomy, armor, posture, weapon, aura, and silhouette]

Scene:
[1 to 2 sentences describing ruins, weather, battlefield, moonlight, furnace light, burial grounds, abyssal mines, or ritual architecture]

Mood:
[fearsome / solemn / tragic / predatory / regal / cursed / delirious / sacred / apocalyptic]

Must-have details:
- [detail 1]
- [detail 2]
- [detail 3]
- [detail 4]

Art direction:
- portrait-oriented TCG full art
- one monster only
- painterly realism
- high detail
- dramatic internal lighting
- readable silhouette at card size
- ornate dark fantasy materials
- no modern UI or logo elements
- no comedic tone
- no chibi proportions
- no generic trading card border inside the art
- render for a card-art window at 1200 x 1110 px or equivalent
- keep the main creature inside an 8% safe area

Negative constraints:
- no flat studio look
- no white background
- no extra characters
- no text inside the art
- no random clutter that damages readability
```

## Naming Guidance

Southpaw names should feel ancient, severe, ceremonial, or region-bound.

Prefer:

- invented names with weight and texture
- titles tied to faction, ruin, role, or ritual duty
- names that imply relic burden, beast lineage, grave function, or war rank

Avoid:

- modern casual names
- parody naming
- direct reuse of famous fantasy names from other franchises

## Future Card Checklist

Before approving a new monster art prompt, confirm:

- the silhouette is readable
- the dominant color is clear
- the background supports the creature
- the creature feels old, dangerous, and lore-bearing
- the result fits Southpaw's world and card presentation
- the art respects the `1200 x 1110 px` target or equivalent ratio
- the creature stays inside the 8% safe area

## Short Prompt Version

```md
Create a premium dark-fantasy TCG monster illustration for Southpaw, designed for a card-art window in a near-square ratio, ideally 1200 x 1110 px, with one clear central monster, painterly realism, dramatic magical lighting, ancient ruined-world atmosphere, strong silhouette, ornate materials, and a dominant two-color palette. Keep the monster fully readable inside an 8% safe area and use --ar 11:10 when generating in Midjourney.
```
