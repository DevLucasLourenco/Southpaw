# Monster Prototypes

## Uso deste documento

Este arquivo guarda os prototipos de expansao do Southpaw em formato proximo ao banco, mas com foco em design.

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
```
