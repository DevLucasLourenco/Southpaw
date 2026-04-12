# Monster Prototypes pt.2

## Demônio do Junco

```yaml
id: 201
slug: demonio-do-junco
name: Demônio do Junco
title: Ceifador dos Brejos
description: Uma entidade espectral formada por juncos encharcados, lama e máscaras de ossos, que caça almas perdidas nos pântanos.
lore: Dizem que o Demônio do Junco surge ao anoitecer, onde a névoa é mais densa e os vivos se perdem entre as vozes do brejo. Ele coleciona promessas quebradas e conduz os incautos para o fundo das águas paradas.
card_type: Demônio
attribute: Água Sombria
level: 7
attack: 2200
defense: 1800
health: 2500
agility: 4
mana_cost: 6
primary_color: '#3B5C3A'
secondary_color: '#A3BFA3'
image_path: '/assets/monsters/Demonio-do-Junco.png'
ability_name: Abraço do Brejo
ability_text: Escolha 1 carta inimiga; ela perde 600 de HP e não pode atacar até o fim do próximo turno. Se já estiver com menos de metade da vida, é destruída imediatamente.
ability_elixir_cost: 2
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'card'

mj_visual_brief:
  faction_or_origin: Pântanos de Junco-Morto, Brejo das Vozes
  role_or_battlefield_identity: ceifador espectral, predador de almas, espírito do brejo
  visual_concept: >
    Uma figura alta e disforme, composta de juncos encharcados, lama escura e máscaras de ossos de animais. Olhos brilhando em meio à névoa, mãos longas e garras feitas de raízes. O corpo parece se desfazer em névoa e água parada.
    A silhueta deve ser ameaçadora, com detalhes de vegetação úmida e ossos pendendo do corpo.
  scene: >
    Um brejo enevoado, com águas paradas, juncos altos, troncos submersos e luzes-fantasma ao fundo. O ambiente deve transmitir sensação de perdição e silêncio mortal.
  mood:
    - ameaçador
    - melancólico
    - ancestral
  must_have_details:
    - máscaras de ossos
    - juncos e raízes úmidas
    - olhos brilhando na névoa
    - corpo parcialmente dissolvido em água
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
    - one image only
    - single full-body portrait
    - no multiple versions
    - no collage, no grid
    - painterly realism
    - high detail
    - dramatic internal lighting
    - readable silhouette at card size
    - ornate dark fantasy materials
  negative_constraints:
    - no flat studio look
    - no white background
    - no extra characters
    - no text inside the art
    - no random clutter that damages readability
    - no multiple versions
    - no collage
    - no grid
    - no split image
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```
