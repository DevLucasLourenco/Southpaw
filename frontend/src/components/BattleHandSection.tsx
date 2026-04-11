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

export function BattleHandSection({
  title,
  cards,
  isActiveTurn,
  draggedSlug,
  onCardDragStart,
  onCardDragEnd,
  onCardClick,
}: BattleHandSectionProps) {
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
        {cards.map((monster) => (
          <div
            key={monster.slug}
            className="hand-card-slot"
            draggable={isActiveTurn}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/southpaw-card-slug", monster.slug);
              onCardDragStart(monster.slug);
            }}
            onDragEnd={onCardDragEnd}
          >
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
                attack: monster.attack,
                defense: monster.defense,
                agility: monster.agility,
                health: monster.health,
              }}
              isSelected={draggedSlug === monster.slug}
              onClick={isActiveTurn ? () => onCardClick(monster.slug) : undefined}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
