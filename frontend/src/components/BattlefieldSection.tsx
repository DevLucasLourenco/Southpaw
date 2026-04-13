import { ArrowLeftRight, Sword } from 'lucide-react';
import type { DragEvent } from 'react';

import type { RuntimeBattleCard } from '../features/battle/types';
import { BattleCard } from './BattleCard';

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
  viewerRole: 'player' | 'spectator';
  viewerSeat: 'player_one' | 'player_two' | null;
  activeSeat: 'player_one' | 'player_two' | null;
  onSelectAttack?: (cardId: string) => void;
  onSelectAbility?: (card: RuntimeBattleCard) => void;
  onChangePosition?: (card: RuntimeBattleCard) => void;
  pulsingActionKey?: string | null;
  onPracticeRemoveEnemyCard?: (card: RuntimeBattleCard) => void;
  isDropEnabled?: boolean;
  activeDropSlot?: number | null;
  onSlotDragEnter?: (slotIndex: number) => void;
  onSlotDragLeave?: () => void;
  onSlotDrop?: (slotIndex: number, event: DragEvent<HTMLElement>) => void;
  onEmptySlotClick?: (slotIndex: number) => void;
};

function buildSlots(cards: RuntimeBattleCard[], slotCount: number) {
  return Array.from(
    { length: slotCount },
    (_, index) => cards.find((card) => card.slot_index === index) ?? null,
  );
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
  onSelectAttack,
  onSelectAbility,
  onChangePosition,
  pulsingActionKey = null,
  onPracticeRemoveEnemyCard,
  isDropEnabled = false,
  activeDropSlot = null,
  onSlotDragEnter,
  onSlotDragLeave,
  onSlotDrop,
  onEmptySlotClick,
}: BattlefieldSectionProps) {
  const slots = buildSlots(cards, slotCount);

  return (
    <section
      className={['battlefield', activeDropSlot !== null ? 'battlefield--drop-active' : ''].join(
        ' ',
      )}
    >
      <h3>{title}</h3>
      <div className="battlefield__grid">
        {slots.map((card, index) => {
          const ghost = ghosts[`slot-${index}`];
          const displayCard = card ?? ghost ?? null;
          const isGhost = !card && Boolean(ghost);
          const isSlotDroppable = isDropEnabled && !card;
          const isSlotDropActive = activeDropSlot === index;
          const canShowControls = Boolean(
            card &&
            onSelectAttack &&
            onSelectAbility &&
            viewerRole === 'player' &&
            viewerSeat === activeSeat,
          );

          return (
            <div
              key={`slot-${title}-${index}`}
              className={[
                'battlefield__slot',
                isSlotDroppable ? 'battlefield__slot--droppable' : '',
                isSlotDropActive ? 'battlefield__slot--drop-active' : '',
              ].join(' ')}
              onDragOver={
                isSlotDroppable
                  ? (event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'move';
                      onSlotDragEnter?.(index);
                    }
                  : undefined
              }
              onDragEnter={isSlotDroppable ? () => onSlotDragEnter?.(index) : undefined}
              onDragLeave={
                isSlotDroppable
                  ? (event) => {
                      if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        return;
                      }
                      onSlotDragLeave?.();
                    }
                  : undefined
              }
              onDrop={
                isSlotDroppable
                  ? (event) => {
                      event.preventDefault();
                      onSlotDrop?.(index, event);
                    }
                  : undefined
              }
            >
              {displayCard ? (
                <div className="battlefield__card-stack">
                  <BattleCard
                    card={displayCard}
                    isSelectable={Boolean(card && (selectedAttacker || selectedAbilityCard))}
                    isSelected={Boolean(
                      card &&
                      (selectedAttackerId === card.instance_id ||
                        selectedAbilityCardId === card.instance_id ||
                        selectedAbilityTargetIds.includes(card.instance_id)),
                    )}
                    isActionSource={Boolean(card && actionSourceId === card.instance_id)}
                    isActionTarget={Boolean(card && actionTargetId === card.instance_id)}
                    isSummoning={Boolean(card && summoningCardId === card.instance_id)}
                    isDestroyed={isGhost}
                    isDamaged={Boolean(card && damagedCardIds.has(card.instance_id))}
                  />

                  {canShowControls && card ? (
                    <div className="battlefield__interaction-bar">
                      <button
                        className={[
                          'battlefield__action-button',
                          selectedAttackerId === card.instance_id ? 'battlefield__action-button--selected' : '',
                          pulsingActionKey === `${card.instance_id}:attack` ? 'battlefield__action-button--pulsing' : '',
                        ].join(' ')}
                        disabled={!card.can_attack || card.position !== 'attack'}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectAttack?.(card.instance_id);
                        }}
                        title="Atacar"
                      >
                        <Sword size={13} />
                      </button>
                      <button
                        className={[
                          'battlefield__action-button',
                          'battlefield__ability-btn',
                          selectedAbilityCardId === card.instance_id ? 'battlefield__action-button--selected' : '',
                          pulsingActionKey === `${card.instance_id}:ability` ? 'battlefield__action-button--pulsing' : '',
                        ].join(' ')}
                        disabled={!card.can_use_ability}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectAbility?.(card);
                        }}
                        title={`${card.ability_name} — custo ${card.ability_elixir_cost}`}
                      >
                        <span className="battlefield__ability-btn-name">{card.ability_name}</span>
                        <span className="battlefield__ability-btn-cost">
                          {card.ability_elixir_cost}
                        </span>
                      </button>
                      <button
                        className={[
                          'battlefield__action-button',
                          pulsingActionKey === `${card.instance_id}:position` ? 'battlefield__action-button--pulsing' : '',
                        ].join(' ')}
                        disabled={!card.can_change_position}
                        onClick={(event) => {
                          event.stopPropagation();
                          onChangePosition?.(card);
                        }}
                        title={`Posição: ${card.position === 'attack' ? 'ATK' : 'DEF'}`}
                      >
                        <ArrowLeftRight size={13} />
                        <span>{card.position === 'attack' ? 'ATK' : 'DEF'}</span>
                      </button>
                    </div>
                  ) : null}

                  {card && onPracticeRemoveEnemyCard && viewerRole === 'player' ? (
                    <div className="battlefield__interaction-bar battlefield__interaction-bar--single">
                      <button
                        className="battlefield__action-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onPracticeRemoveEnemyCard(card);
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <button
                  type="button"
                  className={[
                    'battlefield__slot-placeholder',
                    isSlotDroppable ? 'battlefield__slot-placeholder--droppable' : '',
                    isSlotDropActive ? 'battlefield__slot-placeholder--active' : '',
                  ].join(' ')}
                  onClick={onEmptySlotClick ? () => onEmptySlotClick(index) : undefined}
                >
                  <span>Zona {index + 1}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
