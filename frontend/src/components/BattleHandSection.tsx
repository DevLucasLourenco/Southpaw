import type { CSSProperties } from "react";
import type { Monster } from "../features/monsters/types";
import { BattleCard } from "./BattleCard";

type BattleHandSectionProps = {
  cards: Monster[];
  collapsed?: boolean;
  isActiveTurn: boolean;
  draggedSlug: string | null;
  onCardDragStart: (slug: string) => void;
  onCardDragEnd: () => void;
  onCardClick: (slug: string) => void;
};

const HAND_DRAG_DATA_KEY = "text/southpaw-card-slug";

export function BattleHandSection({
  cards,
  collapsed = false,
  isActiveTurn,
  draggedSlug,
  onCardDragStart,
  onCardDragEnd,
  onCardClick,
}: BattleHandSectionProps) {
  if (collapsed) {
    return (
      <section className="hand-panel hand-panel--collapsed">
        <div className="hand-collapsed-strip">
          {cards.map((monster, index) => (
            <button
              key={monster.slug}
              type="button"
              className={[
                "hand-collapsed-card",
                draggedSlug === monster.slug ? "hand-collapsed-card--selected" : "",
              ].join(" ")}
              style={
                {
                  "--hand-collapsed-primary": monster.primary_color,
                  "--hand-collapsed-secondary": monster.secondary_color,
                  "--hand-collapsed-z-index": 50 + index,
                } as CSSProperties
              }
              draggable={isActiveTurn}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.dropEffect = "move";
                event.dataTransfer.setData(HAND_DRAG_DATA_KEY, monster.slug);
                event.dataTransfer.setData("text/plain", monster.slug);
                onCardDragStart(monster.slug);
              }}
              onDragEnd={() => onCardDragEnd()}
              onClick={isActiveTurn ? () => onCardClick(monster.slug) : undefined}
              title={`${monster.name} | custo ${monster.mana_cost}`}
            >
              <span className="hand-collapsed-card__mana">{monster.mana_cost}</span>
              <span className="hand-collapsed-card__name">{monster.name}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  const handCenter = (cards.length - 1) / 2;
  const extraCards = Math.max(0, cards.length - 5);
  const rotationStep = Math.max(2.2, 4.4 - extraCards * 0.2);
  const translateStep = Math.max(2, 14 - extraCards * 1.4);
  const liftStep = Math.max(2, 7 - extraCards * 0.45);
  const overlap = Math.max(-74, -30 - extraCards * 5);

  return (
    <section className="hand-panel">
      <div className="hand-card-grid">
        {cards.map((monster, index) => {
          const offsetFromCenter = index - handCenter;
          const rotation = offsetFromCenter * rotationStep;
          const translateX = offsetFromCenter * -translateStep;
          const lift = Math.abs(offsetFromCenter) * liftStep;
          const zIndex = 100 + index;
          const style = {
            "--hand-rotation": `${rotation}deg`,
            "--hand-translate-x": `${translateX}px`,
            "--hand-lift": `${lift}px`,
            "--hand-overlap": `${overlap}px`,
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
