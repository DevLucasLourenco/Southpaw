import { useState, type CSSProperties, type DragEventHandler, type ReactNode } from "react";

type BattleCardVisual = {
  slug: string;
  name: string;
  title: string;
  description?: string;
  card_type: string;
  attribute: string;
  level?: number;
  mana_cost: number;
  primary_color: string;
  secondary_color: string;
  image_path: string;
  ability_name: string;
  ability_text?: string;
  ability_elixir_cost: number;
  attack: number;
  defense: number;
  agility: number;
  is_token?: boolean;
  token_kind?: string | null;
  position?: "attack" | "defense";
  health?: number;
  current_health?: number;
  max_health?: number;
};

type BattleCardProps = {
  card: BattleCardVisual;
  variant?: "field" | "reserve" | "hand";
  isSelectable?: boolean;
  isSelected?: boolean;
  isActionSource?: boolean;
  isActionTarget?: boolean;
  isSummoning?: boolean;
  isDestroyed?: boolean;
  isDamaged?: boolean;
  draggable?: boolean;
  onClick?: () => void;
  onDragStart?: DragEventHandler<HTMLElement>;
  onDragEnd?: DragEventHandler<HTMLElement>;
  footer?: ReactNode;
};

export function BattleCard({
  card,
  variant = "field",
  isSelectable = false,
  isSelected = false,
  isActionSource = false,
  isActionTarget = false,
  isSummoning = false,
  isDestroyed = false,
  isDamaged = false,
  draggable = false,
  onClick,
  onDragStart,
  onDragEnd,
  footer,
}: BattleCardProps) {
  const [imageHidden, setImageHidden] = useState(false);

  const style = {
    "--card-primary": card.is_token ? "#f5f2ea" : card.primary_color,
    "--card-secondary": card.is_token ? "#d8d2c2" : card.secondary_color,
  } as CSSProperties;

  const healthValue = variant === "field" ? card.current_health ?? card.health ?? 0 : card.health ?? card.max_health ?? 0;
  const healthCap = variant === "field" ? card.max_health ?? card.health ?? 0 : card.health ?? card.max_health ?? 0;

  return (
    <article
      className={[
        "battle-card",
        variant === "reserve" ? "battle-card--reserve" : "",
        variant === "hand" ? "battle-card--hand" : "",
        isSelectable ? "battle-card--selectable" : "",
        isSelected ? "battle-card--selected" : "",
        isActionSource ? "battle-card--action-source" : "",
        isActionTarget ? "battle-card--action-target" : "",
        isSummoning ? "battle-card--summoning" : "",
        isDestroyed ? "battle-card--destroyed" : "",
        isDamaged ? "battle-card--damaged" : "",
        card.is_token ? "battle-card--token" : "",
      ].join(" ")}
      style={style}
      draggable={draggable}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="battle-card__frame-glow" />
      <header className="battle-card__header">
        <div>
          <span>
            {card.is_token ? "TOKEN" : card.card_type}
            {card.position ? ` | ${card.position === "attack" ? "ATK" : "DEF"}` : ""}
          </span>
          <strong>{card.name}</strong>
        </div>
        <div className="battle-card__cost">{card.is_token ? "T" : card.mana_cost}</div>
      </header>

      <div className="battle-card__meta">
        <span>{card.attribute}</span>
        <span>Nivel {card.level ?? "-"}</span>
      </div>

      <div className="battle-card__art">
        <div className="battle-card__art-frame">
          {imageHidden ? (
            <div className="battle-card__placeholder">
              <span>{card.is_token ? "TOKEN" : card.name}</span>
            </div>
          ) : (
            <img
              src={`http://localhost:8000${card.image_path}`}
              alt={card.name}
              draggable={false}
              onError={() => setImageHidden(true)}
            />
          )}
        </div>
      </div>

      <div className="battle-card__body">
        <div className="battle-card__title-box">
          <strong>{card.title}</strong>
          {card.description ? <span>{card.description}</span> : null}
        </div>
        <div className="battle-card__stats">
          <span>{variant === "field" ? `HP ${healthValue}/${healthCap}` : `HP ${healthCap}`}</span>
          <span>ATK {card.attack}</span>
          <span>DEF {card.defense}</span>
          <span>AGI {card.agility}</span>
        </div>
        <p className="battle-card__ability">
          <strong>{card.is_token ? card.ability_name : `${card.ability_name} (${card.ability_elixir_cost})`}</strong>
          <span>{card.ability_text ?? card.title}</span>
        </p>
      </div>

      {footer ? <div className="battle-card__footer">{footer}</div> : null}
    </article>
  );
}
