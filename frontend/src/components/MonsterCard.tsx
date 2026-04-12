import { useState, type CSSProperties } from "react";

import type { Monster } from "../features/monsters/types";

function formatAbilityLimit(scope: string, count: number) {
  if (!count || count <= 0) {
    return "Sem uso";
  }
  if (scope === "duel") {
    return `${count}x duelo`;
  }
  return `${count}x turno`;
}

function formatTargetMode(targetMode: string) {
  switch (targetMode) {
    case "none":
      return "Sem alvo";
    case "card":
      return "Alvo: carta";
    case "player":
      return "Alvo: duelista";
    case "card_or_player":
      return "Alvo: carta/duelista";
    case "ally_card":
      return "Alvo: aliada";
    case "two_cards":
      return "Alvo: 2 cartas";
    case "up_to_two_cards":
      return "Alvo: ate 2";
    case "all_cards":
      return "Alvo: todas";
    case "all_enemy_cards":
      return "Alvo: campo inimigo";
    default:
      return "Alvo: livre";
  }
}

type MonsterCardProps = {
  monster: Monster;
};

export function MonsterCard({ monster }: MonsterCardProps) {
  const [imageHidden, setImageHidden] = useState(false);
  const style = {
    "--card-primary": monster.primary_color,
    "--card-secondary": monster.secondary_color,
  } as CSSProperties;

  return (
    <article className="monster-card monster-card--tcg" style={style}>
      <div className="monster-card__foil" />

      <header className="monster-card__header">
        <div>
          <p className="monster-card__eyebrow">{monster.card_type}</p>
          <h2>{monster.name}</h2>
        </div>
        <div className="monster-card__cost">
          <span>{monster.mana_cost}</span>
        </div>
      </header>

      <div className="monster-card__meta-row">
        <span>{monster.attribute}</span>
        <span>Nv {monster.level}</span>
      </div>

      <figure className="monster-card__art monster-card__art--tcg">
        {imageHidden ? (
          <div className="monster-card__placeholder">
            <span>{monster.name}</span>
          </div>
        ) : (
          <img
            src={`http://localhost:8000${monster.image_path}`}
            alt={monster.name}
            onError={() => setImageHidden(true)}
          />
        )}
      </figure>

      <section className="monster-card__title-box">
        <strong>{monster.title}</strong>
      </section>

      <section className="monster-card__effect-box">
        <div className="monster-card__effect-copy">
          <label>Descricao</label>
          <p>{monster.description}</p>
        </div>
        <div className="monster-card__effect-copy">
          <label>{monster.ability_name}</label>
          <p>{monster.ability_text}</p>
        </div>
        <div className="monster-card__effect-copy monster-card__effect-copy--flavor">
          <label>Lenda</label>
          <p>{monster.lore}</p>
        </div>
      </section>

      <div className="monster-card__contract">
        <span>Hab {monster.ability_elixir_cost}</span>
        <span>{formatAbilityLimit(monster.ability_limit_scope, monster.ability_limit_count)}</span>
        <span>{formatTargetMode(monster.ability_target_mode)}</span>
      </div>

      <footer className="monster-card__stats monster-card__stats--tcg">
        <div>
          <span>ATK</span>
          <strong>{monster.attack}</strong>
        </div>
        <div>
          <span>DEF</span>
          <strong>{monster.defense}</strong>
        </div>
        <div>
          <span>HP</span>
          <strong>{monster.health}</strong>
        </div>
      </footer>
    </article>
  );
}
