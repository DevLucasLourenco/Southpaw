import { useState, type CSSProperties, type DragEventHandler } from 'react';

export type BattleCardVisual = {
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
  ability_elixir_cost?: number;
  ability_limit_scope?: string;
  ability_limit_count?: number;
  ability_target_mode?: string;
  attack: number;
  base_attack?: number;
  defense: number;
  base_defense?: number;
  is_token?: boolean;
  token_kind?: string | null;
  position?: 'attack' | 'defense';
  health?: number;
  current_health?: number;
  max_health?: number;
};

type BattleCardProps = {
  card: BattleCardVisual;
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
};

export function BattleCard({
  card,
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
}: BattleCardProps) {
  const [imageHidden, setImageHidden] = useState(false);

  const style = {
    '--card-primary': card.is_token ? '#f5f2ea' : card.primary_color,
    '--card-secondary': card.is_token ? '#d8d2c2' : card.secondary_color,
  } as CSSProperties;

  const healthValue = card.current_health ?? card.health ?? 0;
  const healthCap = card.max_health ?? card.health ?? 0;
  const imageSource = `http://localhost:8000${card.image_path}`;

  return (
    <article
      className={[
        'battle-card',
        // não há mais variantes
        isSelectable ? 'battle-card--selectable' : '',
        isSelected ? 'battle-card--selected' : '',
        isActionSource ? 'battle-card--action-source' : '',
        isActionTarget ? 'battle-card--action-target' : '',
        isSummoning ? 'battle-card--summoning' : '',
        isDestroyed ? 'battle-card--destroyed' : '',
        isDamaged ? 'battle-card--damaged' : '',
        card.is_token ? 'battle-card--token' : '',
      ].join(' ')}
      style={style}
      draggable={draggable}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="battle-card__frame-glow" />

      <div className="battle-card__superline">
        <span>{card.is_token ? 'Token' : card.card_type}</span>
        <span>|</span>
        <span>{card.attribute}</span>
      </div>

      <div className="battle-card__headline">
        <strong>{card.name}</strong>
        <span className="battle-card__mana-orb">{card.is_token ? 'T' : card.mana_cost}</span>
      </div>

      <div className="battle-card__art-row">
        <div className="battle-card__art-shell">
          {imageHidden ? (
            <div className="battle-card__placeholder">
              <span>{card.is_token ? 'TOKEN' : card.name}</span>
            </div>
          ) : (
            <img
              className="battle-card__image"
              src={imageSource}
              alt={card.name}
              draggable={false}
              onError={() => setImageHidden(true)}
            />
          )}
        </div>

        <div className="battle-card__side-stats">
          <div className="battle-card__side-stat">
            <span>HP</span>
            <strong>
              `${healthValue}/\n${healthCap}`
            </strong>
          </div>
          <div className="battle-card__side-stat battle-card__side-stat--divider">
            <span>ATK</span>
            <strong>{card.attack}</strong>
          </div>
          <div className="battle-card__side-stat battle-card__side-stat--divider">
            <span>DEF</span>
            <strong>{card.defense}</strong>
          </div>
        </div>
      </div>

      <div className="battle-card__divider" />

      <div className="battle-card__effect-box">
        <strong className="battle-card__ability-name">{card.ability_name}</strong>
        <p className="battle-card__ability-text">
          {card.ability_text ?? card.title ?? card.description ?? 'Sem habilidade registrada.'}
        </p>
      </div>

      <div className="battle-card__divider" />
    </article>
  );
}
