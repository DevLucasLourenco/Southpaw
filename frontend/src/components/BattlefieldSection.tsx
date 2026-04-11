import type { DragEvent } from "react";

import type { RuntimeBattleCard } from "../features/battle/types";
import { BattleCard } from "./BattleCard";

type DestroyedGhostMap = Record<string, RuntimeBattleCard>;

type BattlefieldSectionProps = {
  title: string;
  cards: RuntimeBattleCard[];
  slotCount: number;
  ghosts: DestroyedGhostMap;
  selectedAttacker: RuntimeBattleCard | null;
  selectedAbilityCard: RuntimeBattleCard | null;
  selectedAttackerId: string | null;
  selectedAbilityCardId: string | null;
  selectedAbilityTargetIds?: string[];
  actionSourceId: string | null;
  actionTargetId: string | null;
  summoningCardId: string | null;
  damagedCardIds: Set<string>;
  viewerRole: "player" | "spectator";
  viewerSeat: "player_one" | "player_two" | null;
  activeSeat: "player_one" | "player_two" | null;
  onAttackTarget: (card: RuntimeBattleCard) => void;
  onAbilityTarget: (card: RuntimeBattleCard) => void;
  onSelectAttack?: (cardId: string) => void;
  onSelectAbility?: (card: RuntimeBattleCard) => void;
  onChangePosition?: (card: RuntimeBattleCard) => void;
  isDropEnabled?: boolean;
  isDropActive?: boolean;
  onFieldDragOver?: () => void;
  onFieldDragLeave?: () => void;
  onFieldDrop?: (event: DragEvent<HTMLElement>) => void;
};

function buildSlots(cards: RuntimeBattleCard[], slotCount: number) {
  return Array.from({ length: slotCount }, (_, index) => cards[index] ?? null);
}

export function BattlefieldSection({
  title,
  cards,
  slotCount,
  ghosts,
  selectedAttacker,
  selectedAbilityCard,
  selectedAttackerId,
  selectedAbilityCardId,
  selectedAbilityTargetIds = [],
  actionSourceId,
  actionTargetId,
  summoningCardId,
  damagedCardIds,
  viewerRole,
  viewerSeat,
  activeSeat,
  onAttackTarget,
  onAbilityTarget,
  onSelectAttack,
  onSelectAbility,
  onChangePosition,
  isDropEnabled = false,
  isDropActive = false,
  onFieldDragOver,
  onFieldDragLeave,
  onFieldDrop,
}: BattlefieldSectionProps) {
  const slots = buildSlots(cards, slotCount);

  return (
    <section
      className={["battlefield", isDropActive ? "battlefield--drop-active" : ""].join(" ")}
      onDragOver={
        isDropEnabled
          ? (event) => {
              event.preventDefault();
              onFieldDragOver?.();
            }
          : undefined
      }
      onDragLeave={isDropEnabled ? () => onFieldDragLeave?.() : undefined}
      onDrop={
        isDropEnabled
          ? (event) => {
              event.preventDefault();
              onFieldDrop?.(event);
            }
          : undefined
      }
    >
      <h3>{title}</h3>
      {isDropEnabled ? (
        <div className={["battlefield__drop-hint", isDropActive ? "battlefield__drop-hint--active" : ""].join(" ")}>
          Solte uma carta da mao aqui para invocar
        </div>
      ) : null}
      <div className="battlefield__grid">
        {slots.map((card, index) => {
          const ghost = ghosts[`slot-${index}`];
          const displayCard = card ?? ghost ?? null;
          const isGhost = !card && Boolean(ghost);

          return (
            <div key={`slot-${title}-${index}`} className="battlefield__slot">
              {displayCard ? (
                <BattleCard
                  card={displayCard}
                  isSelectable={Boolean(card && (selectedAttacker || selectedAbilityCard))}
                  isSelected={Boolean(
                    card &&
                      (
                        selectedAttackerId === card.instance_id ||
                        selectedAbilityCardId === card.instance_id ||
                        selectedAbilityTargetIds.includes(card.instance_id)
                      ),
                  )}
                  isActionSource={Boolean(card && actionSourceId === card.instance_id)}
                  isActionTarget={Boolean(card && actionTargetId === card.instance_id)}
                  isSummoning={Boolean(card && summoningCardId === card.instance_id)}
                  isDestroyed={isGhost}
                  isDamaged={Boolean(card && damagedCardIds.has(card.instance_id))}
                  onClick={
                    card
                      ? () => {
                          if (selectedAttacker) {
                            onAttackTarget(card);
                          } else if (selectedAbilityCard) {
                            onAbilityTarget(card);
                          }
                        }
                      : undefined
                  }
                  footer={
                    card && onSelectAttack && onSelectAbility && viewerRole === "player" && viewerSeat === activeSeat ? (
                      <div className="battle-card__actions">
                        <button
                          disabled={!card.can_attack || card.position !== "attack"}
                          onClick={(event) => {
                            event.stopPropagation();
                            onSelectAttack(card.instance_id);
                          }}
                        >
                          Atacar
                        </button>
                        <button
                          disabled={!card.can_use_ability}
                          onClick={(event) => {
                            event.stopPropagation();
                            onSelectAbility(card);
                          }}
                        >
                          Hab. {card.ability_elixir_cost}
                        </button>
                        <button
                          disabled={!card.can_change_position}
                          onClick={(event) => {
                            event.stopPropagation();
                            onChangePosition?.(card);
                          }}
                        >
                          {card.position === "attack" ? "DEF" : "ATK"}
                        </button>
                      </div>
                    ) : null
                  }
                />
              ) : (
                <div className="battlefield__slot-placeholder">
                  <span>Zona {index + 1}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
