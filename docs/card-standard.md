# Card Standard

## Objetivo

Este documento define o padrao estrutural que todas as cartas de Southpaw devem seguir, tanto no catalogo quanto dentro da batalha.

## Identidade compartilhada da carta

Toda carta deve preservar estes elementos base:

- acentos de cor dominantes vindos da paleta do monstro
- moldura premium
- hierarquia tipografica forte
- custo visivel
- status de combate visiveis
- area dedicada para habilidade
- `level` como marcador principal de progressao

`level` e o valor de progressao relevante para o jogo neste momento.

`rarity` fica adiado para uma fase futura do produto e nao deve guiar balanceamento nem hierarquia visual agora.

## Padrao fisico de referencia

A carta fisica de referencia segue o tamanho classico de TCG:

- `59 mm x 86 mm`
- proporcao aproximada de `59:86`

Esse padrao serve para a moldura completa da carta.

## Padrao definitivo da carta de batalha

A carta usada em mao, campo e selecoes compactas deve seguir exatamente esta anatomia:

1. Linha superior:
   `{card_type} | {attribute}`

2. Cabecalho principal:
   `{name}        {mana_cost}`

3. Bloco de arte:
   `{image}        {level}`

4. Divisor visual:
   linha no estilo de TCG/Yu-Gi-Oh

5. Bloco de efeito:
   `{ability_name}`
   `{ability_text}`

6. Divisor visual:
   linha no estilo de TCG/Yu-Gi-Oh

7. Rodape:
   `HP {health} | ATK {attack} | DEF {defense} | AGI {agility}`

## Regras visuais obrigatorias da arte

- a arte do monstro nao deve seguir a proporcao da carta inteira
- a arte deve ser produzida para a janela de imagem da carta
- a imagem precisa preencher visualmente todo o quadro de arte
- nao deve sobrar bloco cinza escuro de preenchimento ao redor do monstro
- o `level` deve aparecer em estrelas, na vertical, ao lado da imagem
- o custo de elixir deve ser uma bolinha discreta com o numero

## Tamanho oficial da imagem do monstro

Para o layout atual do Southpaw, a arte precisa seguir este padrao:

- proporcao ideal da arte: `1.08:1`
- tamanho ideal: `1200 x 1110 px`
- alternativa premium: `1400 x 1295 px`
- minimo aceitavel: `900 x 830 px`
- safe area recomendada: `8%` em cada borda

### Como compor a imagem

- o monstro deve ficar centralizado
- partes importantes nao devem encostar nas bordas
- cabeca, armas, asas, chifres e maos devem permanecer dentro da safe area
- o fundo pode se expandir mais, mas o assunto principal nao deve depender da borda para leitura

## Regra para Midjourney e outros geradores

Quando a ferramenta aceitar proporcao e nao tamanho exato:

- usar proporcao alvo equivalente a `1.08:1`
- no Midjourney, usar como aproximacao `--ar 11:10`

Quando a ferramenta aceitar resolucao exata:

- preferir `1200 x 1110 px`

## Padrao da carta no campo

- a carta no campo deve usar o mesmo layout da carta na mao
- a mesma estrutura visual deve refletir na mao, no campo e em selecoes compactas
- o layout da carta deve ser modularizado em um unico componente visual
- as acoes da carta no campo nao devem ficar dentro da carta

## Area de interacao no campo

Abaixo da carta em campo deve existir uma caixa separada contendo:

- `Atacar`
- `Hab. {valor elixir}`
- `Alterar Posicao`

Isso reduz a altura irreal da carta no campo e preserva o molde TCG.

## Padrao de posicionamento da arena

- a mesa e o elemento principal da tela
- os paineis pessoais devem ficar nas laterais
- logs e informacoes secundarias devem ficar fora do nucleo da mesa
- os slots precisam manter largura e altura consistentes
- uma unica carta nunca deve crescer a ponto de dominar a linha inteira
- a mao do jogador reutiliza a mesma familia visual da carta de batalha
- a mao adversaria aparece como cartas viradas para baixo com contagem visivel

## Checklist para criacao futura

Toda nova carta deve definir:

- slug
- name
- title
- attribute
- card_type
- level
- mana_cost
- attack
- defense
- health
- agility
- ability_name
- ability_text
- primary_color
- secondary_color
- image_path
- padrao de arte em `1200 x 1110 px` ou proporcao equivalente

## Regra de UX

Se uma decisao visual prejudicar a leitura da mesa durante a partida, a legibilidade do jogo tem prioridade sobre detalhe decorativo.
