import type { CSSProperties } from "react";

import type { Monster } from "../features/monsters/types";
import { BattleCard } from "./BattleCard";

type MonsterCardProps = {
  monster: Monster;
};

export function MonsterCard({ monster }: MonsterCardProps) {
  const style = {
    "--card-primary": monster.primary_color,
    "--card-secondary": monster.secondary_color,
  } as CSSProperties;

  return (
    <article className="monster-showcase monster-showcase--stacked" style={style}>
      <div className="monster-showcase__card monster-showcase__card--centered">
        <BattleCard
          variant="hand"
          card={{
            slug: monster.slug,
            name: monster.name,
            title: monster.title,
            description: monster.description,
            card_type: monster.card_type,
            attribute: monster.attribute,
            level: monster.level,
            mana_cost: monster.mana_cost,
            primary_color: monster.primary_color,
            secondary_color: monster.secondary_color,
            image_path: monster.image_path,
            ability_name: monster.ability_name,
            ability_text: monster.ability_text,
            ability_elixir_cost: monster.ability_elixir_cost,
            ability_limit_scope: monster.ability_limit_scope,
            ability_limit_count: monster.ability_limit_count,
            ability_target_mode: monster.ability_target_mode,
            attack: monster.attack,
            defense: monster.defense,
            health: monster.health,
            current_health: monster.health,
            max_health: monster.health,
          }}
        />
      </div>

      <section className="monster-showcase__text-block">
        <div className="monster-showcase__text-section">
          <label>Descricao</label>
          <p>{monster.description}</p>
        </div>

        <div className="monster-showcase__text-section">
          <label>Lore</label>
          <p>{monster.lore}</p>
        </div>
      </section>
    </article>
  );
}
