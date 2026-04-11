import { useState, type CSSProperties } from "react";

import type { Monster } from "../features/monsters/types";

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
    <article className="monster-card" style={style}>
      <div className="monster-card__foil" />
      <header className="monster-card__header">
        <div>
          <p className="monster-card__eyebrow">{monster.card_type}</p>
          <h2>{monster.name}</h2>
          <p className="monster-card__title">{monster.title}</p>
        </div>
        <div className="monster-card__meta">
          <span className="monster-card__attribute">{monster.attribute}</span>
          <span className="monster-card__cost">{monster.mana_cost}</span>
        </div>
      </header>

      <div className="monster-card__stars" aria-label={`Level ${monster.level}`}>
        {Array.from({ length: monster.level }).map((_, index) => (
          <span key={`${monster.slug}-star-${index}`}>★</span>
        ))}
      </div>

      <figure className="monster-card__art">
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
        <figcaption>{monster.lore}</figcaption>
      </figure>

      <section className="monster-card__description">
        <p>{monster.description}</p>
        <div className="monster-card__ability">
          <strong>{monster.ability_name}</strong>
          <span>{monster.ability_text}</span>
        </div>
      </section>

      <footer className="monster-card__stats">
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
        <div>
          <span>AGI</span>
          <strong>{monster.agility}</strong>
        </div>
      </footer>
    </article>
  );
}
