# Monster Prototypes

## Uso deste documento

Este arquivo guarda os prototipos de expansao do Southpaw em formato proximo ao banco, mas com foco em design.

Cada bloco YAML abaixo contem dois niveis de informacao:

- campos de gameplay e catalogo, que representam os dados estruturais do monstro
- `mj_visual_brief`, que nao deve ser persistido no banco e existe apenas para alimentar o pipeline de arte e conversao para Midjourney

Regras desta base:

- `level` e o eixo principal de progressao e balanceamento
- `rarity` foi propositalmente omitido e fica para uma fase futura do projeto
- as habilidades abaixo foram revisadas para evitar efeitos fracos demais, redundantes ou dependentes de interacao no turno inimigo
- sempre que um debuff aparece como relevante, ele prefere durar ate o fim do proximo turno em vez de sumir cedo demais

---

### 1. Dragao Pistola

```yaml
id: 101
slug: dragao-pistola
name: Dragao Pistola
title: Executor da Garganta Trovejante
description: Um draco blindado com maxilares de canhao e costelas de bronze recarregadas por runas de combustao.
lore: Criado nas furnas de Boca de Ferrum, so desperta quando um cerco precisa terminar em um unico estampido sagrado.
card_type: Draconoide
attribute: Fogo Belico
level: 9
attack: 2900
defense: 2100
health: 3000
agility: 3
mana_cost: 10
primary_color: '#A84A2A'
secondary_color: '#E0B36B'
image_path: '/assets/monsters/Dragao-Pistola.png'
ability_name: Veredito de Balao
ability_text: 1x por turno, destroi 1 carta no campo. Depois do disparo, esta carta nao pode atacar neste turno.
ability_elixir_cost: 3
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'card'

mj_visual_brief:
  faction_or_origin: Arsenal da Garganta Trovejante, Boca de Ferrum
  role_or_battlefield_identity: siege dragon, brutal executioner, frontline artillery beast
  visual_concept: >
    A heavily armored dragon with cannon-like jaws and bronze rib plating engraved with combustion blue fire runes.
    Its chest burns like a sealed blue furnace, with internal blue fire leaking through cracked seams in the armor.
    The creature should stand in an aggressive forward posture, built like a living siege weapon.
    Its silhouette must feel massive, ancient, and explosive.
  scene: >
    A ruined furnace battlefield filled with ash storms, scorched stone, and shattered siege structures.
    The background should reinforce the sense of artillery warfare without competing with the creature.
  mood:
    - fearsome
    - apocalyptic
    - ritualistic
  must_have_details:
    - cannon-like jaws
    - glowing combustion runes
    - blackened heat-cracked armor
    - furnace light inside the chest
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 2. Cartomante do Fio Nulo

```yaml
id: 102
slug: cartomante-do-fio-nulo
name: Cartomante do Fio Nulo
title: Contadora de Pressagios
description: Uma vidente ritual que costura cartas, cordoes e juramentos para manipular o fluxo do duelo.
lore: As Cartomantes da Escadaria de Odris nao preveem o futuro; elas calculam o preco para que ele aconteca.
card_type: Mistica
attribute: Arcano
level: 4
attack: 900
defense: 1400
health: 1500
agility: 5
mana_cost: 4
primary_color: '#D8D1BA'
secondary_color: '#355A7A'
image_path: '/assets/monsters/Cartomante-do-Fio-Nulo.png'
ability_name: Contagem da Mesa
ability_text: Gera 1 de elixir para cada monstro em campo, ate 6. Se gerar 4 ou mais, esta carta nao pode atacar neste turno.
ability_elixir_cost: 2
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'none'

mj_visual_brief:
  faction_or_origin: Catedra das Cartas Cegas, Escadaria de Odris
  role_or_battlefield_identity: ritual diviner, resource manipulator, arcane accountant
  visual_concept: >
    A ritual seer wrapped in layered ivory cloth, suspended cords, blindfold veils, and stitched divination cards.
    Her hands should be surrounded by thread, seals, and floating tally marks as if she is weaving fate into debt.
    The design must feel elegant and unsettling rather than fragile.
    Her silhouette should be readable through veils, cards, and thread geometry.
  scene: >
    A vertical archive-sanctuary of stairs, ledgers, prayer niches, and divinatory vaults lit by cold blue ritual light.
    The environment should feel sacred, cerebral, and financially oppressive.
  mood:
    - solemn
    - cursed
    - sacred
  must_have_details:
    - stitched cards
    - ritual cords
    - blindfold or veil
    - deep ivory and cold blue accents
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 3. Cervo de Aurivau

```yaml
id: 103
slug: cervo-de-aurivau
name: Cervo de Aurivau
title: Arauto do Veio Dourado
description: Uma besta mineral de galhadas talhadas em geodo que sustenta aliados como um altar movente.
lore: Onde pisa, o chao vibra com as memorias dos guardioes soterrados.
card_type: Guardiao
attribute: Terra Solar
level: 6
attack: 1700
defense: 2400
health: 2800
agility: 3
mana_cost: 6
primary_color: '#8A7E67'
secondary_color: '#E6C76A'
image_path: '/assets/monsters/Cervo-de-Aurivau.png'
ability_name: Antifona Mineral
ability_text: Escolha 1 carta aliada; ela recupera 300 de HP e ganha 400 de DEF ate o fim do proximo turno. Se ja estiver em defesa, recebe tambem 200 de ATK neste turno.
ability_elixir_cost: 1
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'ally_card'

mj_visual_brief:
  faction_or_origin: Bastiao do Geodo, Abismo de Aurivau
  role_or_battlefield_identity: mineral guardian beast, defensive support, living altar
  visual_concept: >
    A monumental stag made of stone, geode antlers, and mineral hide with gold-lit fractures running through its body.
    Its antlers should feel like carved cathedral branches of crystal and ore.
    The beast must project calm defensive power, like a moving shrine that protects nearby allies.
    Its silhouette should be regal, broad, and immediately identifiable at card size.
  scene: >
    An abyssal mine-temple with dust, hanging chains, ancient pillars, and veins of buried gold glowing in the rock.
    The background should reinforce sacred geology and ancestral memory.
  mood:
    - solemn
    - regal
    - sacred
  must_have_details:
    - geode antlers
    - gold-lit fractures
    - altar-like posture
    - mineral dust and stone texture
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 4. Midas, o Áureo

```yaml
id: 104
slug: midas-aureo
nome: Midas, o Áureo
titulo: Rei do Toque Dourado
descricao: Um soberano amaldiçoado cuja pele reluz como ouro vivo, capaz de transformar aliados e inimigos em estátuas resplandecentes.
lore: Dizem que Midas foi o último regente do Abismo de Aurivau a tentar fundir carne e ouro em um só voto. Sua dádiva, presente dos deuses minerais, tornou-se maldição: tudo que tocava virava relíquia, mas perdia o pulso da vida. Hoje, sua corte é feita de estátuas e ecos de promessas não cumpridas.
tipo_carta: Guardião
atributo: Luz Terrena
nivel: 4
ataque: 1900
defesa: 2100
vida: 2600
agilidade: 2
custo_mana: 6
cor_primaria: '#C9A227'
cor_secundaria: '#FFD700'
caminho_imagem: '/assets/monsters/Midas-Aureo.png'
nome_habilidade: Toque de Ouro
texto_habilidade: Escolha 1 carta (aliada ou inimiga); ela fica com 1 de vida, mas seu ataque é dobrado até o fim do próximo turno. Se for aliada, ela não pode ser destruída neste turno; se for inimiga, não pode atacar.
custo_elixir_habilidade: 1
escopo_limite_habilidade: 'turno'
limite_uso_habilidade: 1
modo_alvo_habilidade: 'qualquer_carta'
faccao: Bastião do Geodo
regiao: Abismo de Aurivau
temas: [maldição, ouro vivo, voto quebrado, petrificação]

mj_visual_brief:
  faction_or_origin: Bastiao do Geodo, Abismo de Aurivau
  role_or_battlefield_identity: cursed king, petrifying sovereign, relic-touched ruler
  visual_concept: >
    A regal sovereign whose flesh and robes have partially transformed into living gold and cracked mineral ornament.
    His body should look beautiful and cursed at once, with one hand extended as if bestowing a blessing that is actually petrification.
    The design must feel like royalty trapped inside its own miracle.
    The silhouette should prioritize crown, mantle, and the fatal gesture of touch.
  scene: >
    A buried golden court filled with cracked statues, ruined thrones, and dust-covered ceremonial architecture deep below Aurivau.
    The background should feel like the aftermath of a kingdom turned into treasure.
  mood:
    - regal
    - tragic
    - cursed
  must_have_details:
    - living gold skin
    - cracked royal ornaments
    - statue-filled court
    - outstretched golden hand
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: "--ar 1:1 --v 6 --style raw --q 2"
```

### 5. Irma da Vela Oca

```yaml
id: 104
slug: irma-da-vela-oca
name: Irma da Vela Oca
title: Novica da Cinza Serena
description: Uma monja carbonizada que vela ruinas e reata carne a partir de brasas sagradas.
lore: As Irmas da Vela Oca aprenderam que a chama mais fiel e a que arde em silencio.
card_type: Cleriga
attribute: Chama
level: 3
attack: 800
defense: 1500
health: 1700
agility: 4
mana_cost: 3
primary_color: '#A44A39'
secondary_color: '#F0C38C'
image_path: '/assets/monsters/Irma-da-Vela-Oca.png'
ability_name: Vigilia de Cinza
ability_text: Cura 500 de vida do jogador e restaura 400 de HP de uma carta aliada. Se o alvo estiver abaixo de metade da vida, gera 1 de elixir.
ability_elixir_cost: 2
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'ally_card'

mj_visual_brief:
  faction_or_origin: Legiao da Brasa Oca, Caldeira de Nhar
  role_or_battlefield_identity: ash nun, healer of embers, battlefield cleric
  visual_concept: >
    A carbonized young nun in burned ceremonial robes, carrying a hollow candle reliquary filled with sacred embers.
    Her body should look marked by heat and devotion rather than monstrous corruption.
    The design must combine tenderness and ritual severity, as if healing itself requires surviving fire.
    Her silhouette should be calm, upright, and recognizable through candlelight and ash-worn garments.
  scene: >
    A silent chapel ruin of volcanic stone, with drifting ash, prayer chains, and low ember light among collapsed altars.
    The environment should feel intimate, devotional, and scorched.
  mood:
    - solemn
    - sacred
    - tragic
  must_have_details:
    - hollow candle reliquary
    - burned ceremonial cloth
    - soft ember glow
    - ash-covered chapel atmosphere
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 5. Feral de Serelune

```yaml
id: 105
slug: feral-de-serelune
name: Feral de Serelune
title: Cacador da Mare Azul
description: Um predador espectral de ossos finos e chama fria, feito para perseguir alvos exaustos entre lapides partidas.
lore: Dizem que a mare da necropole sobe quando um Feral sente medo no sangue dos vivos.
card_type: Espectro
attribute: Lua Sombria
level: 5
attack: 1900
defense: 1100
health: 1800
agility: 7
mana_cost: 4
primary_color: '#5BD7E8'
secondary_color: '#D9F6FF'
image_path: '/assets/monsters/Feral-de-Serelune.png'
ability_name: Rastro de Lua
ability_text: Causa 400 de dano a 1 inimigo. Se o alvo for uma carta, ela muda para ataque e perde 300 de DEF ate o fim do proximo turno.
ability_elixir_cost: 1
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'card_or_player'

mj_visual_brief:
  faction_or_origin: Vigilia da Lua Morta, Necropole de Serelune
  role_or_battlefield_identity: spectral hunter, fast predator, moonlit execution beast
  visual_concept: >
    A lean grave-born predator with fine bone structure, spectral fur, and thin blue lunar flame trailing from its limbs and jaws.
    Its body should feel built for pursuit, silence, and sudden violence.
    The creature must look elegant, feral, and half-spiritual, with motion implied even in stillness.
    Its silhouette should be narrow, predatory, and unmistakably moon-bound.
  scene: >
    A moonlit gravefield of broken tombs, cold mist, tilted gravestones, and pale cemetery fire under an endless night sky.
    The background should support silent speed and funerary dread.
  mood:
    - predatory
    - tragic
    - fearsome
  must_have_details:
    - spectral blue flame
    - fine bone anatomy
    - graveyard mist
    - moonlit predator posture
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 6. Bobo do Nono Rasgo

```yaml
id: 106
slug: bobo-do-nono-rasgo
name: Bobo do Nono Rasgo
title: Riso Entre Espelhos
description: Um arauto do caos coberto de seda, sinos e mascaras rachadas que converte confusao em vantagem.
lore: Ninguem recorda se fala por si ou por aquilo que usa o seu rosto.
card_type: Trapaceiro
attribute: Caos
level: 5
attack: 1600
defense: 1200
health: 1700
agility: 6
mana_cost: 4
primary_color: '#7C2C39'
secondary_color: '#B08AD6'
image_path: '/assets/monsters/Bobo-do-Nono-Rasgo.png'
ability_name: Troca de Mascara
ability_text: Escolha 2 cartas no campo; elas trocam de posicao de batalha. Se uma delas estiver em defesa, ambas perdem 300 de ATK ate o fim do proximo turno.
ability_elixir_cost: 2
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'two_cards'

mj_visual_brief:
  faction_or_origin: Corte do Rasgo Nono, Palacio dos Espelhos Cegos
  role_or_battlefield_identity: chaos jester, positional manipulator, omen thief
  visual_concept: >
    A theatrical trickster draped in layered silk, bells, ribbons, and cracked masks hanging across the body.
    Its posture should feel playful and dangerous at the same time, as if every gesture reshapes the duel.
    The design must look elegant, unstable, and mentally disorienting rather than merely clownish.
    Its silhouette should emphasize the mask arrangement, ribbons, and raised hands of misdirection.
  scene: >
    A fractured mirror hall with blind reflections, torn curtains, gilded decay, and dreamlike violet smoke.
    The background should feel aristocratic, warped, and psychologically unsafe.
  mood:
    - delirious
    - cursed
    - elegant
  must_have_details:
    - cracked masks
    - bells and silk ribbons
    - mirror shards
    - violet dream-smoke
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 7. Corista de Odris

```yaml
id: 107
slug: corista-de-odris
name: Corista de Odris
title: Voz dos Debitos Sacros
description: Uma escriba cantora que entoa contas rituais para comprimir o custo da guerra.
lore: Na Catedra das Cartas Cegas, toda melodia e uma formula de cobranca.
card_type: Mistica
attribute: Arcano
level: 3
attack: 700
defense: 1300
health: 1200
agility: 5
mana_cost: 3
primary_color: '#C8C0A5'
secondary_color: '#6B84A0'
image_path: '/assets/monsters/Corista-de-Odris.png'
ability_name: Liturgia de Desconto
ability_text: Gera 2 de elixir. Se voce controlar outra carta Arcana, gera +1 adicional.
ability_elixir_cost: 1
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'none'

mj_visual_brief:
  faction_or_origin: Catedra das Cartas Cegas, Escadaria de Odris
  role_or_battlefield_identity: ritual singer, sacred bookkeeper, elixir support mystic
  visual_concept: >
    A severe choir-scribe in layered robes, carrying scrolls, abacus-like relics, and tally charms that resonate as she sings.
    Her mouth and hands should release visible liturgical geometry, as if song itself reduces the cost of war.
    The design must feel bureaucratic, sacred, and arcane rather than martial.
    Her silhouette should remain readable through scroll tubes, ledger ornaments, and disciplined posture.
  scene: >
    A vaulted archive-cathedral of stairs, suspended ledgers, bronze censers, and blue-lit sanctuaries of debt.
    The background should convey ritual administration and sacred accounting.
  mood:
    - solemn
    - sacred
    - ritualistic
  must_have_details:
    - scroll relics
    - liturgical sound geometry
    - ivory and blue palette
    - clerical singer posture
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 8. Mastim da Forja Muda

```yaml
id: 108
slug: mastim-da-forja-muda
name: Mastim da Forja Muda
title: Dente de Corrente
description: Um cao de guerra de ferro negro, sem latido, usado para travar avancos e prender alvos.
lore: As correntes em seu dorso pertenciam a um rei que tentou fugir da propria armadura.
card_type: Besta
attribute: Chama
level: 4
attack: 1400
defense: 1600
health: 1900
agility: 4
mana_cost: 4
primary_color: '#6D3A30'
secondary_color: '#D88F4B'
image_path: '/assets/monsters/Mastim-da-Forja-Muda.png'
ability_name: Mordida de Grilhao
ability_text: O alvo inimigo muda imediatamente para defesa e perde 400 de DEF ate o fim do proximo turno. Se ja estiver em defesa, sofre 300 de dano adicional.
ability_elixir_cost: 1
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'card'

mj_visual_brief:
  faction_or_origin: Legiao da Brasa Oca, Caldeira de Nhar
  role_or_battlefield_identity: war hound, chain enforcer, frontline suppressor
  visual_concept: >
    A black-iron war mastiff built like a compact furnace, with heavy chain harnesses embedded into its back and shoulders.
    Its mouth and chest should emit restrained heat rather than wild fire, reinforcing the idea of silent brutality.
    The design must feel disciplined, oppressive, and made to pin enemies in place.
    Its silhouette should be low, muscular, and anchored by chain weight.
  scene: >
    A forge corridor of cracked iron flooring, sparks, hot smoke, and broken restraints hanging from pillars.
    The environment should feel industrial, punitive, and close-quarters.
  mood:
    - fearsome
    - brutal
    - ritualistic
  must_have_details:
    - embedded chains
    - black iron body
    - restrained ember vents
    - silent war hound posture
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 9. Viuva do Espelho Cego

```yaml
id: 109
slug: viuva-do-espelho-cego
name: Viuva do Espelho Cego
title: Noiva da Memoria Troca
description: Uma dama amaldiocoada que veste luto em seda escura e carrega um espelho sem reflexo.
lore: Toda vez que a Viuva olha para um inimigo, alguma lembranca deixa de pertencer a ele.
card_type: Ilusionista
attribute: Caos
level: 6
attack: 1200
defense: 1700
health: 1600
agility: 5
mana_cost: 5
primary_color: '#4A2335'
secondary_color: '#C3B5E9'
image_path: '/assets/monsters/Viuva-do-Espelho-Cego.png'
ability_name: Casca de Reflexo Vazio
ability_text: Dissipa aprimoramentos do alvo, reduz o HP atual dele para 50% arredondado para baixo e faz esta carta ganhar 300 de ATK ate o fim do turno.
ability_elixir_cost: 2
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'card'

mj_visual_brief:
  faction_or_origin: Corte do Rasgo Nono, Palacio dos Espelhos Cegos
  role_or_battlefield_identity: mourning illusionist, memory thief, dueling manipulator
  visual_concept: >
    A cursed widow in severe black silk carrying a blind mirror that reflects nothing but hunger.
    Her presence should feel elegant and predatory, like someone who steals identity through sorrow rather than force.
    The design must emphasize absence, vanity, and emotional cruelty.
    Her silhouette should prioritize the mirror, trailing veil, and aristocratic mourning posture.
  scene: >
    A ruined ballroom of dark velvet, broken mirror frames, pale reflections, and candlelight swallowed by shadow.
    The background should feel intimate, decadent, and psychologically hostile.
  mood:
    - tragic
    - cursed
    - elegant
  must_have_details:
    - blind mirror
    - mourning silk
    - veil or funeral headpiece
    - fractured reflection motifs
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 10. Cavaleiro do Veio Partido

```yaml
id: 110
slug: cavaleiro-do-veio-partido
name: Cavaleiro do Veio Partido
title: Guarda do Selo Profundo
description: Um guardiao em armadura geologica que luta como muralha viva e pune ofensivas impensadas.
lore: Jurou nunca recuar, mesmo depois de o proprio corpo começar a virar rocha.
card_type: Guardiao
attribute: Terra Solar
level: 6
attack: 1800
defense: 2600
health: 2900
agility: 2
mana_cost: 6
primary_color: '#7A756A'
secondary_color: '#DDBE69'
image_path: '/assets/monsters/Cavaleiro-do-Veio-Partido.png'
ability_name: Parede de Lastro
ability_text: Assume modo de defesa, recupera 700 de HP e recebe 500 de DEF ate o fim do proximo turno. Se ja estava em defesa, gera 1 de elixir.
ability_elixir_cost: 1
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'none'

mj_visual_brief:
  faction_or_origin: Bastiao do Geodo, Abismo de Aurivau
  role_or_battlefield_identity: stone knight, defensive bulwark, living bastion
  visual_concept: >
    A heavily armored knight whose plate has merged with geological mass, cracked stone, and gold-veined mineral growth.
    The figure should feel like a fortress given humanoid form, planted in absolute refusal to retreat.
    The design must emphasize defensive bulk, oath-bound resolve, and slow sacred violence.
    Its silhouette should be broad, shield-like, and monumentally stable.
  scene: >
    A sealed subterranean gate hall of carved rock, old warding pillars, mineral dust, and gold-lit fractures in the walls.
    The background should reinforce duty, endurance, and ancient containment.
  mood:
    - solemn
    - regal
    - fearsome
  must_have_details:
    - geological armor fusion
    - gold mineral veins
    - fortress-like stance
    - seal-guarding architecture
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 11. Corvo da Lapide Sem Nome

```yaml
id: 111
slug: corvo-da-lapide-sem-nome
name: Corvo da Lapide Sem Nome
title: Beija-olhos da Vigilia
description: Uma ave necrolunar de plumagem cinza-azulada que fareja o fim antes da morte chegar.
lore: O corvo nao se alimenta de carne, mas de nomes esquecidos.
card_type: Besta
attribute: Lua Sombria
level: 2
attack: 1100
defense: 700
health: 1000
agility: 8
mana_cost: 2
primary_color: '#688EA7'
secondary_color: '#D6F4FF'
image_path: '/assets/monsters/Corvo-da-Lapide-Sem-Nome.png'
ability_name: Pouso de Omen
ability_text: Gera 1 de elixir. Se houver ao menos 1 carta em defesa no campo, gera +1 adicional e esta carta recebe 200 de ATK neste turno.
ability_elixir_cost: 1
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'none'

mj_visual_brief:
  faction_or_origin: Vigilia da Lua Morta, Necropole de Serelune
  role_or_battlefield_identity: omen raven, swift scavenger, lunar resource finder
  visual_concept: >
    A necrolunar raven with blue-gray feathers, pale eyes, and subtle corpse-cold fire threaded through its wings.
    It should feel unnervingly intelligent, light, and fast, as if it arrives just before endings become real.
    The design must stay elegant and readable, without losing supernatural threat.
    Its silhouette should remain sharp through beak, wings, and moonlit plumage.
  scene: >
    A cemetery ridge above nameless graves, with cold wind, pale moonlight, and drifting spectral cinders.
    The background should support omen, speed, and funerary watchfulness.
  mood:
    - predatory
    - solemn
    - ominous
  must_have_details:
    - blue-gray plumage
    - pale moonlit eyes
    - spectral cinders
    - graveyard ridge
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 12. Prior do Fogo Afogado

```yaml
id: 112
slug: prior-do-fogo-afogado
name: Prior do Fogo Afogado
title: Pregador da Chama Impossivel
description: Um sacerdote coberto por tecido molhado em breu e brasas que nunca se apagam.
lore: Seu culto nasceu quando uma chama tentou sobreviver debaixo d'agua e aprendeu a odiar o mundo.
card_type: Clerigo
attribute: Chama
level: 6
attack: 1500
defense: 1400
health: 2000
agility: 3
mana_cost: 5
primary_color: '#8F3E2C'
secondary_color: '#F1B16F'
image_path: '/assets/monsters/Prior-do-Fogo-Afogado.png'
ability_name: Sermo Carbonico
ability_text: Causa 500 a todas as cartas no campo, inclusive aliadas. Cartas que sobreviverem perdem 300 de ATK ate o fim do proximo turno.
ability_elixir_cost: 3
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'all_cards'

mj_visual_brief:
  faction_or_origin: Legiao da Brasa Oca, drowned heretical branch
  role_or_battlefield_identity: drowned fire priest, battlefield preacher, sacrificial purifier
  visual_concept: >
    A gaunt priest covered in tar-dark wet cloth, carrying impossible embers that refuse to die even under water.
    His body and robes should look soaked, heavy, and still internally burning, creating a contradiction between drowning and flame.
    The design must feel heretical, severe, and spiritually violent.
    His silhouette should prioritize the drenched vestments, ember cores, and preaching gesture.
  scene: >
    A flooded shrine of black stone, shallow reflective water, dripping walls, and stubborn firelight burning through damp air.
    The environment should feel blasphemous and impossible.
  mood:
    - cursed
    - sacred
    - apocalyptic
  must_have_details:
    - wet tar-dark robes
    - embers that survive water
    - flooded sanctuary
    - fanatical sermon posture
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 13. Rastejante de Geodo

```yaml
id: 113
slug: rastejante-de-geodo
name: Rastejante de Geodo
title: Verme do Selo Vivo
description: Uma criatura mineral longa e pesada que remenda fendilhas no campo como se costurasse pedra.
lore: Alguns mineiros juram que os Rastejantes nao escavam. Eles fecham caminhos proibidos.
card_type: Colosso
attribute: Terra Solar
level: 6
attack: 1600
defense: 2800
health: 3200
agility: 1
mana_cost: 6
primary_color: '#6E6B61'
secondary_color: '#D7B85B'
image_path: '/assets/monsters/Rastejante-de-Geodo.png'
ability_name: Costura de Fenda
ability_text: Escolha 1 carta aliada; ela muda para defesa, recupera 300 de HP e ganha 500 de DEF ate o fim do proximo turno.
ability_elixir_cost: 1
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'ally_card'

mj_visual_brief:
  faction_or_origin: Bastiao do Geodo, Abismo de Aurivau
  role_or_battlefield_identity: mineral worm colossus, living seal, defensive support beast
  visual_concept: >
    A colossal segmented mineral worm with cracked stone plating, dense mass, and glowing geode seams across its body.
    It should feel ancient, subterranean, and more like a living mechanism of closure than an animal.
    The design must evoke the idea of sealing wounds in the world by force.
    Its silhouette should be long, heavy, and unmistakably earthbound.
  scene: >
    A deep collapse chamber of broken mine shafts, dust clouds, rune-marked stone, and sealed fissures glowing faintly with gold.
    The background should suggest buried power and forbidden passages.
  mood:
    - solemn
    - fearsome
    - ritualistic
  must_have_details:
    - segmented stone body
    - glowing geode seams
    - sealed fissures
    - colossal subterranean mass
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 14. Duquista Sem Face

```yaml
id: 114
slug: duquista-sem-face
name: Duquista Sem Face
title: Campeao dos Bailes Fendidos
description: Um espadachim mascarado cuja face foi substituida por um vazio espelhado.
lore: Nos saloes do Rasgo Nono, perder o rosto e o preco da elegancia perfeita.
card_type: Duelista
attribute: Caos
level: 7
attack: 2400
defense: 1500
health: 2100
agility: 7
mana_cost: 7
primary_color: '#6B1E2E'
secondary_color: '#E4C475'
image_path: '/assets/monsters/Duquista-Sem-Face.png'
ability_name: Etiqueta de Sangue
ability_text: Escolhe uma carta em ataque; ela e forcada para defesa e perde 500 de ATK ate o fim do proximo turno.
ability_elixir_cost: 2
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'card'

mj_visual_brief:
  faction_or_origin: Corte do Rasgo Nono, Palacio dos Espelhos Cegos
  role_or_battlefield_identity: masked duelist, etiquette enforcer, aristocratic executioner
  visual_concept: >
    An elegant swordsman in ceremonial dueling attire whose face has been replaced by a polished void-like mirror surface.
    Its posture should feel perfectly controlled, refined, and lethal, as if violence has been choreographed into court ritual.
    The design must balance nobility with existential unease.
    Its silhouette should prioritize rapier line, coat tails, and the faceless mirrored head.
  scene: >
    A candlelit dueling salon with cracked marble, torn drapery, blind mirrors, and old blood beneath courtly splendor.
    The background should feel sophisticated, decadent, and hostile.
  mood:
    - elegant
    - fearsome
    - cursed
  must_have_details:
    - faceless mirrored head
    - ceremonial dueling attire
    - long thin blade
    - courtly ruin atmosphere
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 15. Astrarca do Cimo Partido

```yaml
id: 115
slug: astrarca-do-cimo-partido
name: Astrarca do Cimo Partido
title: Oraculo da Escada Final
description: Um arconte magro envolto em pergaminhos celestes e laminas astrais apagadas.
lore: Le os ceus como quem consulta faturas de um deus insolvente.
card_type: Oraculo
attribute: Arcano
level: 7
attack: 2100
defense: 1800
health: 2200
agility: 5
mana_cost: 7
primary_color: '#BFC4C9'
secondary_color: '#5678A3'
image_path: '/assets/monsters/Astrarca-do-Cimo-Partido.png'
ability_name: Calculo de Catastrofe
ability_text: Escolhe 1 inimigo; se ele tiver menos elixir que voce, sofre 900 de dano. Caso contrario, sofre 400 e perde 1 de elixir.
ability_elixir_cost: 3
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'card_or_player'

mj_visual_brief:
  faction_or_origin: Catedra das Cartas Cegas, upper stair sanctuaries of Odris
  role_or_battlefield_identity: astral oracle, doom calculator, high arcane evaluator
  visual_concept: >
    A tall austere oracle wrapped in star-marked scrolls, celestial parchments, and extinguished astral blades.
    The figure should look intellectually dangerous, as if cosmic knowledge has replaced ordinary mercy.
    The design must feel vertical, severe, and judicial in its mysticism.
    Its silhouette should emphasize floating parchments, worn sacred fabrics, and suspended astral relics.
  scene: >
    A high observatory-stair of Odris with open vault ceilings, cold blue constellations, suspended records, and broken astrolabe architecture.
    The background should suggest celestial accounting and final judgment.
  mood:
    - solemn
    - sacred
    - apocalyptic
  must_have_details:
    - celestial scrolls
    - extinguished astral blades
    - cold star-lit aura
    - vertical observatory architecture
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 16. Canhoneiro de Ferrum

```yaml
id: 116
slug: canhoneiro-de-ferrum
name: Canhoneiro de Ferrum
title: Servo da Retomada Rubra
description: Um veterano de cerco com ombro de bronze e caldeira presa ao torax.
lore: Jura nunca disparar sem nomear o pecado do alvo.
card_type: Artilheiro
attribute: Fogo Belico
level: 4
attack: 1500
defense: 900
health: 1500
agility: 3
mana_cost: 4
primary_color: '#92513A'
secondary_color: '#C2A06C'
image_path: '/assets/monsters/Canhoneiro-de-Ferrum.png'
ability_name: Bala de Ruina
ability_text: Causa 700 a uma carta em ataque. Se ela sobreviver, muda imediatamente para defesa e nao pode trocar de posicao no proximo turno.
ability_elixir_cost: 2
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'card'

mj_visual_brief:
  faction_or_origin: Arsenal da Garganta Trovejante, Boca de Ferrum
  role_or_battlefield_identity: mecha veteran, frontline gunner, ritual artillery mecha
  visual_concept: >
    A scarred siege mecha veteran with a bronze cannon assembly fused to one shoulder and a furnace boiler locked into the chest with blue combustion runes.
    The character should feel practical, disciplined, and made for close artillery execution rather than heroic spectacle.
    The design must combine mecha war experience with industrial ritual machinery.
    Its silhouette should stay readable through the shoulder cannon, armored torso.
  scene: >
    A war-torn foundry trench with smoking rubble, iron barricades, and distant artillery flashes in a storm of ash.
    The background should reinforce a city in chaos.
  mood:
    - brutal
    - fearsome
    - ritualistic
  must_have_details:
    - bronze shoulder cannon
    - chest boiler
    - mecha design, like lockdown from Transformers, with its cannon on the head and shoulder
    - ash-choked siege trench
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 17. Guarda-Luto de Serelune

```yaml
id: 117
slug: guarda-luto-de-serelune
name: Guarda-Luto de Serelune
title: Porteiro da Necropole Sussurrante
description: Um guerreiro espectral de alabarda azul que marcha sem emitir passos.
lore: Nao defende os mortos; impede que os vivos saiam iguais de onde entraram.
card_type: Espectro
attribute: Lua Sombria
level: 5
attack: 1700
defense: 2000
health: 2300
agility: 4
mana_cost: 5
primary_color: '#57BFD9'
secondary_color: '#E4FBFF'
image_path: '/assets/monsters/Guarda-Luto-de-Serelune.png'
ability_name: Vigia da Passagem
ability_text: Um alvo aliado muda imediatamente para defesa, recupera 700 de HP e ganha 300 de DEF ate o fim do proximo turno.
ability_elixir_cost: 2
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'ally_card'

mj_visual_brief:
  faction_or_origin: Vigilia da Lua Morta, Necropole de Serelune
  role_or_battlefield_identity: spectral guard, funerary sentinel, defensive moonlit warden
  visual_concept: >
    A disciplined spectral warrior carrying a long blue-halberd, clad in pale grave armor with cold fire running through the gaps.
    The figure should feel silent, dutiful, and impossible to rush past.
    The design must emphasize guardianship, grief, and restrained supernatural force.
    Its silhouette should center the halberd, layered armor, and ghostly verticality.
  scene: >
    A necropolis gate lined with mausoleums, grave lamps, and low blue mist under relentless moonlight.
    The background should reinforce passage, duty, and sacred vigilance.
  mood:
    - solemn
    - sacred
    - fearsome
  must_have_details:
    - blue halberd
    - grave armor
    - cold spectral fire
    - necropolis gate setting
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 18. Abadesa da Conta Partida

```yaml
id: 118
slug: abadesa-da-conta-partida
name: Abadesa da Conta Partida
title: Senhora das Taxas Sombrias
description: Uma superiora austera que manipula dividas rituais e faz o campo pagar por sua propria existencia.
lore: Dizem que toda guerra em Asterra termina em ruina porque alguem aceitou o credito da Abadesa.
card_type: Mistica
attribute: Arcano
level: 5
attack: 1000
defense: 1900
health: 1800
agility: 4
mana_cost: 5
primary_color: '#D6CFBC'
secondary_color: '#826F4C'
image_path: '/assets/monsters/Abadesa-da-Conta-Partida.png'
ability_name: Taxacao Ritual
ability_text: O oponente perde 1 de elixir para cada 2 cartas no seu campo, arredondado para baixo. Minimo 1, maximo 3. Se perder 3, esta carta recebe 300 de ATK neste turno.
ability_elixir_cost: 2
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'player'

mj_visual_brief:
  faction_or_origin: Catedra das Cartas Cegas, Escadaria de Odris
  role_or_battlefield_identity: abbess of debt, ritual tax collector, oppressive arcane superior
  visual_concept: >
    An austere abbess in layered ivory and bronze vestments, adorned with tally relics, debt seals, and ceremonial account chains.
    Her presence should feel spiritually authoritative and economically cruel, as if the field itself owes her obedience.
    The design must look administrative, sacred, and predatory without becoming physically monstrous.
    Her silhouette should be readable through the severe headpiece, ledger ornaments, and still commanding posture.
  scene: >
    A tribunal sanctuary of ledgers, censers, account altars, and suspended bronze tablets within the vertical city of Odris.
    The background should convey sacred taxation and ritual pressure.
  mood:
    - solemn
    - cursed
    - regal
  must_have_details:
    - debt seals
    - bronze account chains
    - severe abbess vestments
    - ledger-tribunal setting
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 19. Arquiteto do Selo Submerso

```yaml
id: 119
slug: arquiteto-do-selo-submerso
name: Arquiteto do Selo Submerso
title: Pedreiro da Queda Antiga
description: Um titere de pedra santa e coral fossilizado, capaz de remodelar o campo como se fosse tumba.
lore: Construiu muralhas contra um rei que ainda nao havia despertado.
card_type: Colosso
attribute: Terra Solar
level: 8
attack: 2000
defense: 3000
health: 3300
agility: 1
mana_cost: 8
primary_color: '#7B7D79'
secondary_color: '#D1B66C'
image_path: '/assets/monsters/Arquiteto-do-Selo-Submerso.png'
ability_name: Trava de Abobada
ability_text: Ate 2 cartas inimigas mudam para defesa, sofrem 300 de dano e perdem 300 de ATK ate o fim do proximo turno.
ability_elixir_cost: 3
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'up_to_two_cards'

mj_visual_brief:
  faction_or_origin: Bastiao do Geodo, drowned sealworks beneath Aurivau
  role_or_battlefield_identity: submerged seal architect, field controller, stone-corral colossus
  visual_concept: >
    A monumental figure made from holy stone, fossil coral, and drowned architectural mass, more builder than beast.
    Its body should feel carved, ancient, and functionally sacred, as if it exists to reshape space into a tomb.
    The design must emphasize engineering, containment, and abyssal antiquity.
    Its silhouette should prioritize heavy arms, cathedral-like torso forms, and reef-like stone growths.
  scene: >
    A submerged ruin chamber with broken arches, fossil coral, dripping stone, and pressure-worn architecture deep beneath the earth.
    The background should reinforce drowned construction and sealed catastrophe.
  mood:
    - solemn
    - regal
    - apocalyptic
  must_have_details:
    - fossil coral growths
    - holy stone body
    - submerged ruin chamber
    - architectural colossus silhouette
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```

### 20. Reina do Coral Carbonico

```yaml
id: 120
slug: reina-do-coral-carbonico
name: Reina do Coral Carbonico
title: Matriarca das Chamas Abissais
description: Uma entidade regia feita de coral queimado, carapaca vulcanica e luz negra filtrada.
lore: Surge apenas quando o mar subterraneo encontra as furnas mais antigas do mundo.
card_type: Soberana
attribute: Chama Abissal
level: 9
attack: 2600
defense: 2400
health: 3100
agility: 4
mana_cost: 9
primary_color: '#A13B34'
secondary_color: '#6FD6DA'
image_path: '/assets/monsters/Reina-do-Coral-Carbonico.png'
ability_name: Mare de Escoria
ability_text: Causa 600 a todas as cartas inimigas e cura a si mesma em 300 para cada inimigo sobrevivente. Cartas sobreviventes perdem 200 de DEF ate o fim do proximo turno.
ability_elixir_cost: 3
ability_limit_scope: 'turn'
ability_limit_count: 1
ability_target_mode: 'all_enemy_cards'

mj_visual_brief:
  faction_or_origin: Abyssal furnace convergence beneath the ancient world
  role_or_battlefield_identity: abyssal queen, volcanic coral matriarch, battlefield purifier
  visual_concept: >
    A regal abysso-volcanic entity formed from burned coral, volcanic carapace, and dark filtered light beneath the sea.
    She should look majestic and dangerous, like a sovereign born where oceanic pressure met the oldest furnaces in existence.
    The design must combine royal posture, biological strangeness, and apocalyptic heat.
    Her silhouette should be grand, layered, and unmistakably queenly.
  scene: >
    An underground sea-furnace where black water, volcanic stone, glowing vents, and carbonized coral meet in catastrophic beauty.
    The background should feel ancient, abyssal, and imperially destructive.
  mood:
    - regal
    - fearsome
    - apocalyptic
  must_have_details:
    - burned coral crown forms
    - volcanic carapace
    - dark abyssal light
    - underground sea-furnace setting
  art_direction:
    - portrait-oriented TCG full art
    - one monster only
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
  midjourney_params: '--ar 1:1 --v 6 --style raw --q 2'
```
