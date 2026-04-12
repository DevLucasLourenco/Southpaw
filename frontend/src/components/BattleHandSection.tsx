import type { CSSProperties } from "react";
import type { Monster } from "../features/monsters/types";
import { BattleCard } from "./BattleCard";

type BattleHandSectionProps = {
  title: string;
  cards: Monster[];
  isActiveTurn: boolean;
  draggedSlug: string | null;
  onCardDragStart: (slug: string) => void;
  onCardDragEnd: () => void;
  onCardClick: (slug: string) => void;
};

const HAND_DRAG_DATA_KEY = "text/southpaw-card-slug";

export function BattleHandSection({
  title,
  cards,
  isActiveTurn,
  draggedSlug,
  onCardDragStart,
  onCardDragEnd,
  onCardClick,
}: BattleHandSectionProps) {
  const handCenter = (cards.length - 1) / 2;

  return (
    <section className="hand-panel">
      <div className="hand-panel__header">
        <div>
          <p className="section-tag">Mao do duelista</p>
          <h3>{title}</h3>
        </div>
        <span className="hand-panel__count">{cards.length} carta(s)</span>
      </div>

      <div className="hand-card-grid">
        {cards.map((monster, index) => {
          const offsetFromCenter = index - handCenter;
          const rotation = offsetFromCenter * 5.5;
          const translateX = offsetFromCenter * -28;
          const lift = Math.abs(offsetFromCenter) * 10;
          const zIndex = 100 + index;
          const style = {
            "--hand-rotation": `${rotation}deg`,
            "--hand-translate-x": `${translateX}px`,
            "--hand-lift": `${lift}px`,
            "--hand-z-index": zIndex,
            "--hand-hover-z-index": 500 + index,
          } as CSSProperties;

          return (
            <div key={monster.slug} className="hand-card-slot" style={style}>
              <BattleCard
                variant="hand"
                draggable={isActiveTurn}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.dropEffect = "move";
                  event.dataTransfer.setData(HAND_DRAG_DATA_KEY, monster.slug);
                  event.dataTransfer.setData("text/plain", monster.slug);
                  onCardDragStart(monster.slug);
                }}
                onDragEnd={() => onCardDragEnd()}
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
                }}
                isSelected={draggedSlug === monster.slug}
                onClick={isActiveTurn ? () => onCardClick(monster.slug) : undefined}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
