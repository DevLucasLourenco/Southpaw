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

A carta usada em mão, campo e seleções compactas deve seguir exatamente esta anatomia visual (estrutura única, modular):

1. Linha superior:
   `{card_type} | {attribute}`

2. Cabeçalho principal:
   `{name}` (à esquerda, destaque tipográfico)
   `{mana_cost}` (à direita, dentro de uma orbe/bolinha)

3. Bloco de arte:
   `{image}` (imagem do monstro, preenchendo toda a janela de arte)

4. Coluna lateral (ao lado direito da arte):
   - HP (valor atual/máximo)
   - ATK
   - DEF
     (dispostos verticalmente, com destaque de cor)

5. Divisor visual:
   linha no estilo TCG/Yu-Gi-Oh

6. Bloco de efeito:
   - `{ability_name}` (negrito)
   - `{ability_text}` (texto explicativo)

7. Divisor visual:
   linha no estilo TCG/Yu-Gi-Oh

8. (Opcional) Rodapé extra para status especiais, tokens, etc.

**Observações:**

- O layout é sempre modular e único, não há variantes.
- O campo `level` pode ser exibido como estrelas ao lado da arte, se desejado, mas não é obrigatório na linha visual principal.
- O custo de elixir/mana é sempre destacado na orbe no cabeçalho.
- Não existe mais rodapé com todos os status em linha; os status ficam na coluna lateral ao lado da arte.

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

## Checklist para criação de cartas (estrutura oficial)

Toda carta deve definir obrigatoriamente:

- slug (string, único, minúsculo, sem espaços)
- name (string, nome curto para exibição)
- title (string, subtítulo/lore curto)
- description (string, descrição longa/lore)
- card_type (string, ex: Guardião, Draconoide, etc)
- attribute (string, ex: Fogo Bélico, Terra Solar, etc)
- level (int, 1+)
- mana_cost (int, 0+)
- attack (int, 0+)
- defense (int, 0+)
- health (int, 0+)
- primary_color (string, hex ex: '#A84A2A')
- secondary_color (string, hex ex: '#E0B36B')
- image_path (string, caminho relativo ex: '/assets/monsters/Dragao-Pistola.png')
- ability_name (string, nome da habilidade)
- ability_text (string, descrição da habilidade)
- ability_elixir_cost (int, custo de elixir para ativar a habilidade)
- ability_limit_scope (string, ex: 'turn', 'battle', etc)
- ability_limit_count (int, quantas vezes pode usar por escopo)
- ability_target_mode (string, ex: 'card', 'ally_card', 'none', etc)

Campos opcionais (usados em contextos especiais):

- is_token (bool)
- token_kind (string|null)
- base_attack, base_defense, current_health, max_health (int, para runtime)
- position ("attack"|"defense")

**Arte:**

- A arte deve seguir o padrão `1200 x 1110 px` ou equivalente, proporção 1.08:1, com safe area de 8%.

**Exemplo de estrutura JSON:**

```json
{
  "slug": "dragao-pistola",
  "name": "Dragao Pistola",
  "title": "Executor da Garganta Trovejante",
  "description": "Um draco blindado com maxilares de canhao...",
  "card_type": "Draconoide",
  "attribute": "Fogo Belico",
  "level": 9,
  "mana_cost": 10,
  "attack": 2900,
  "defense": 2100,
  "health": 3000,
  "primary_color": "#A84A2A",
  "secondary_color": "#E0B36B",
  "image_path": "/assets/monsters/Dragao-Pistola.png",
  "ability_name": "Veredito de Balao",
  "ability_text": "1x por turno, destroi 1 carta no campo...",
  "ability_elixir_cost": 3,
  "ability_limit_scope": "turn",
  "ability_limit_count": 1,
  "ability_target_mode": "card"
}
```

## Regra de UX

Se uma decisao visual prejudicar a leitura da mesa durante a partida, a legibilidade do jogo tem prioridade sobre detalhe decorativo.
