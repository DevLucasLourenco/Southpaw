import { useEffect, useMemo, useRef, useState } from "react";

import { API_BASE_WS_URL, apiPost } from "../api/client";
import type { CreateRoomResponse, BattleRoomState, RuntimeBattleCard } from "../features/battle/types";
import type { Monster } from "../features/monsters/types";
import { useMonstersQuery } from "../features/monsters/queries";
import { BattleCard } from "./BattleCard";
import { BattleHandSection } from "./BattleHandSection";
import { BattleSidebarCard } from "./BattleSidebarCard";
import { BattlefieldSection } from "./BattlefieldSection";

type BattleArenaProps = {
  roomId: string;
  onLeaveRoom: () => void;
};

type BattleRoomMode = "pvp" | "practice_bot";

type DestroyedGhostMap = Record<string, RuntimeBattleCard>;
const DEFAULT_SLOT_COUNT = 5;
const HAND_DRAG_DATA_KEY = "text/southpaw-card-slug";

function normalizeName(value: string) {
  return value.trim().slice(0, 24) || "Duelist";
}

function buildSlots(cards: RuntimeBattleCard[], slotCount: number) {
  return Array.from({ length: slotCount }, (_, index) => cards.find((card) => card.slot_index === index) ?? null);
}

function buildFacedownCards(count: number) {
  return Array.from({ length: Math.min(count, 7) }, (_, index) => index);
}

function inferMatchEndReason(roomState: BattleRoomState) {
  const lastLogEntry = roomState.log[roomState.log.length - 1]?.toLowerCase() ?? "";
  const players = [roomState.players.player_one, roomState.players.player_two].filter(
    (player): player is NonNullable<typeof roomState.players.player_one> => Boolean(player),
  );

  if (lastLogEntry.includes("time expired")) {
    return "por tempo esgotado";
  }

  if (players.some((player) => player.health <= 0)) {
    return "por vida esgotada";
  }

  return "com supremacia na mesa";
}

function buildOutcomeCopy(roomState: BattleRoomState, viewerSeat: "player_one" | "player_two" | null, viewerRole: "player" | "spectator") {
  if (!roomState.completed || !roomState.winner_seat) {
    return null;
  }

  const winner = roomState.players[roomState.winner_seat];
  const winnerName = winner?.display_name ?? "Duelista vencedor";
  const reason = inferMatchEndReason(roomState);

  if (viewerRole === "spectator" || !viewerSeat) {
    return {
      tone: "neutral" as const,
      title: "Duelo encerrado",
      subtitle: `${winnerName} venceu ${reason}.`,
    };
  }

  if (roomState.winner_seat === viewerSeat) {
    return {
      tone: "victory" as const,
      title: "Vitoria",
      subtitle: `Seu lado venceu ${reason}.`,
    };
  }

  return {
    tone: "defeat" as const,
    title: "Derrota",
    subtitle: `${winnerName} venceu ${reason}.`,
  };
}

export function BattleArena({ roomId, onLeaveRoom }: BattleArenaProps) {
  const params = new URLSearchParams(window.location.search);
  const [draftName, setDraftName] = useState(params.get("name") ?? "");
  const [displayName, setDisplayName] = useState(params.get("name") ?? "");
  const [preferredRole, setPreferredRole] = useState<"player" | "spectator">(
    (params.get("role") as "player" | "spectator") ?? "player",
  );
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "connected">("idle");
  const [roomState, setRoomState] = useState<BattleRoomState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAttackerId, setSelectedAttackerId] = useState<string | null>(null);
  const [selectedAbilityCardId, setSelectedAbilityCardId] = useState<string | null>(null);
  const [selectedAbilityTargetIds, setSelectedAbilityTargetIds] = useState<string[]>([]);
  const [destroyedTopGhosts, setDestroyedTopGhosts] = useState<DestroyedGhostMap>({});
  const [destroyedBottomGhosts, setDestroyedBottomGhosts] = useState<DestroyedGhostMap>({});
  const [damagedCardIds, setDamagedCardIds] = useState<Set<string>>(new Set());
  const [damagedSeats, setDamagedSeats] = useState<Set<string>>(new Set());
  const [spendingElixirSeat, setSpendingElixirSeat] = useState<string | null>(null);
  const [draggedHandSlug, setDraggedHandSlug] = useState<string | null>(null);
  const [activeDropSlot, setActiveDropSlot] = useState<number | null>(null);
  const [pendingSummonSlug, setPendingSummonSlug] = useState<string | null>(null);
  const [pendingSummonSlotIndex, setPendingSummonSlotIndex] = useState<number | null>(null);
  const [practiceSelectedSlug, setPracticeSelectedSlug] = useState<string | null>(null);
  const [practiceTargetSlotIndex, setPracticeTargetSlotIndex] = useState<number | null>(null);
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const prevStateRef = useRef<BattleRoomState | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const monstersQuery = useMonstersQuery();

  useEffect(() => {
    if (!displayName) {
      return;
    }

    let cancelled = false;

    const connect = () => {
      if (cancelled) {
        return;
      }

      setConnectionState("connecting");
      const socket = new WebSocket(
        `${API_BASE_WS_URL}/battle/ws/battle/${roomId}?name=${encodeURIComponent(
          normalizeName(displayName),
        )}&role=${preferredRole}`,
      );
      socketRef.current = socket;

      socket.onopen = () => {
        retryCountRef.current = 0;
        setErrorMessage(null);
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data) as { type: string; payload?: BattleRoomState; message?: string };
        if (message.type === "state" && message.payload) {
          setRoomState(message.payload);
          setConnectionState("connected");
        }
        if (message.type === "error" && message.message) {
          setErrorMessage(message.message);
        }
      };

      socket.onerror = () => {
        if (!cancelled) {
          setErrorMessage("A conexao da arena falhou. Tentando reconectar...");
        }
      };

      socket.onclose = () => {
        socketRef.current = null;
        if (cancelled) {
          return;
        }
        setConnectionState("idle");
        if (retryCountRef.current < 5) {
          retryCountRef.current += 1;
          reconnectTimeoutRef.current = window.setTimeout(connect, 800);
        } else {
          setErrorMessage("Nao foi possivel conectar a arena em tempo real.");
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current && socketRef.current.readyState < WebSocket.CLOSING) {
        socketRef.current.close();
      }
      socketRef.current = null;
    };
  }, [roomId, displayName, preferredRole]);

  const viewerSeat = roomState?.viewer.seat ?? null;
  const viewerRole = roomState?.viewer.role ?? preferredRole;
  const activeSeat = roomState?.active_seat ?? null;
  const fieldSize = roomState?.rules.field_size ?? DEFAULT_SLOT_COUNT;
  const isTimedMode = roomState?.rules.timed ?? true;
  const isPracticeMode = roomState?.mode === "practice_bot";
  const myPlayer = viewerSeat ? roomState?.players[viewerSeat] ?? null : null;
  const topPlayer = viewerSeat === "player_two" ? roomState?.players.player_one ?? null : roomState?.players.player_two ?? null;
  const bottomPlayer = viewerSeat === "player_two" ? roomState?.players.player_two ?? null : roomState?.players.player_one ?? null;
  const isMyTurn = viewerRole === "player" && viewerSeat === activeSeat;

  const monsterMap = useMemo(
    () => new Map((monstersQuery.data?.items ?? []).map((monster) => [monster.slug, monster])),
    [monstersQuery.data?.items],
  );

  const selectedAttacker = useMemo(
    () => myPlayer?.battlefield.find((card) => card.instance_id === selectedAttackerId) ?? null,
    [myPlayer, selectedAttackerId],
  );
  const selectedAbilityCard = useMemo(
    () => myPlayer?.battlefield.find((card) => card.instance_id === selectedAbilityCardId) ?? null,
    [myPlayer, selectedAbilityCardId],
  );
  const handCards = useMemo(() => {
    return (myPlayer?.hand ?? [])
      .map((slug) => monsterMap.get(slug))
      .filter((monster): monster is Monster => Boolean(monster));
  }, [monsterMap, myPlayer?.hand]);
  const highlightedSlotIndex = activeDropSlot ?? pendingSummonSlotIndex;
  const pendingSummonMonster = useMemo(
    () => (pendingSummonSlug ? monsterMap.get(pendingSummonSlug) ?? null : null),
    [monsterMap, pendingSummonSlug],
  );
  const practiceSelectedMonster = useMemo(
    () => (practiceSelectedSlug ? monsterMap.get(practiceSelectedSlug) ?? null : null),
    [monsterMap, practiceSelectedSlug],
  );
  const outcomeCopy = useMemo(
    () => (roomState ? buildOutcomeCopy(roomState, viewerSeat, viewerRole) : null),
    [roomState, viewerRole, viewerSeat],
  );

  useEffect(() => {
    if (!roomState) {
      return;
    }

    const previous = prevStateRef.current;
    const currentAction = roomState.last_action;
    const previousActionId = previous?.last_action?.id ?? null;
    const currentActionId = currentAction?.id ?? null;
    const isNewAction = Boolean(currentActionId && currentActionId !== previousActionId);

    if (isNewAction) {
      setDamagedCardIds(new Set(currentAction?.damaged_card_ids ?? []));
      setDamagedSeats(new Set(currentAction?.damaged_seats ?? []));
      setSpendingElixirSeat(currentAction?.elixir_spent ? currentAction.elixir_spent_seat ?? null : null);
    }

    if (isNewAction && currentAction?.destroyed_card_ids?.length && previous) {
      const previousTopSlots = buildSlots(
        viewerSeat === "player_two" ? previous.players.player_one?.battlefield ?? [] : previous.players.player_two?.battlefield ?? [],
        fieldSize,
      );
      const previousBottomSlots = buildSlots(
        viewerSeat === "player_two" ? previous.players.player_two?.battlefield ?? [] : previous.players.player_one?.battlefield ?? [],
        fieldSize,
      );
      const currentTopSlots = buildSlots(topPlayer?.battlefield ?? [], fieldSize);
      const currentBottomSlots = buildSlots(bottomPlayer?.battlefield ?? [], fieldSize);
      const nextTopGhosts: DestroyedGhostMap = {};
      const nextBottomGhosts: DestroyedGhostMap = {};

      previousTopSlots.forEach((card, index) => {
        if (card && !currentTopSlots.find((current) => current?.instance_id === card.instance_id) && currentAction.destroyed_card_ids?.includes(card.instance_id)) {
          nextTopGhosts[`slot-${index}`] = card;
        }
      });
      previousBottomSlots.forEach((card, index) => {
        if (card && !currentBottomSlots.find((current) => current?.instance_id === card.instance_id) && currentAction.destroyed_card_ids?.includes(card.instance_id)) {
          nextBottomGhosts[`slot-${index}`] = card;
        }
      });

      if (Object.keys(nextTopGhosts).length) {
        setDestroyedTopGhosts(nextTopGhosts);
        window.setTimeout(() => setDestroyedTopGhosts({}), 720);
      }
      if (Object.keys(nextBottomGhosts).length) {
        setDestroyedBottomGhosts(nextBottomGhosts);
        window.setTimeout(() => setDestroyedBottomGhosts({}), 720);
      }
    }

    if (isNewAction && currentAction?.id) {
      window.setTimeout(() => {
        setDamagedCardIds(new Set());
        setDamagedSeats(new Set());
        setSpendingElixirSeat(null);
      }, 650);
    }

    prevStateRef.current = roomState;
  }, [bottomPlayer?.battlefield, fieldSize, roomState, topPlayer?.battlefield, viewerSeat]);

  useEffect(() => {
    setSelectedAttackerId(null);
    setSelectedAbilityCardId(null);
    setSelectedAbilityTargetIds([]);
    setDraggedHandSlug(null);
    setActiveDropSlot(null);
    if (roomState?.last_action?.kind === "summon" || roomState?.last_action?.kind === "turn_start") {
      setPendingSummonSlug(null);
      setPendingSummonSlotIndex(null);
    }
    if (roomState?.last_action?.kind === "practice_spawn_enemy") {
      setPracticeSelectedSlug(null);
      setPracticeTargetSlotIndex(null);
      setActiveDropSlot(null);
      setPracticeModalOpen(false);
    }
    if (roomState?.last_action?.kind === "practice_remove_enemy") {
      setPracticeTargetSlotIndex(null);
    }
  }, [roomState?.last_action?.id]);

  function sendAction(payload: Record<string, unknown>) {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    socketRef.current.send(JSON.stringify(payload));
  }

  function updateUrl(nextName: string, nextRole: "player" | "spectator") {
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set("room", roomId);
    nextParams.set("name", nextName);
    nextParams.set("role", nextRole);
    window.history.replaceState({}, "", `?${nextParams.toString()}`);
  }

  function connectToRoom() {
    const normalizedName = normalizeName(draftName);
    setDisplayName(normalizedName);
    setDraftName(normalizedName);
    updateUrl(normalizedName, preferredRole);
  }

  function copyRoomLink() {
    const link = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(link);
  }

  function openSummonChooser(slug: string, slotIndex: number | null = null) {
    if (!isMyTurn) {
      return;
    }
    setSelectedAttackerId(null);
    setSelectedAbilityCardId(null);
    setSelectedAbilityTargetIds([]);
    setPendingSummonSlug(slug);
    setPendingSummonSlotIndex(slotIndex);
    setActiveDropSlot(slotIndex);
  }

  function confirmSummon(position: "attack" | "defense") {
    if (!pendingSummonSlug || pendingSummonSlotIndex === null) {
      return;
    }
    sendAction({ type: "summon", slug: pendingSummonSlug, position, slot_index: pendingSummonSlotIndex });
    setPendingSummonSlug(null);
    setPendingSummonSlotIndex(null);
    setDraggedHandSlug(null);
    setActiveDropSlot(null);
  }

  function confirmPracticeSpawn(position: "attack" | "defense") {
    if (!practiceSelectedSlug || practiceTargetSlotIndex === null) {
      return;
    }
    sendAction({
      type: "practice_spawn_enemy",
      slug: practiceSelectedSlug,
      position,
      slot_index: practiceTargetSlotIndex,
    });
  }

  function handleAttackTarget(card: RuntimeBattleCard) {
    if (!selectedAttacker) {
      return;
    }
    if (roomState && card.cannot_be_attack_target_until_turn >= roomState.turn_number) {
      setErrorMessage("Esta carta esta protegida contra ataques neste momento.");
      return;
    }
    sendAction({
      type: "attack",
      attacker_id: selectedAttacker.instance_id,
      target_type: "card",
      target_id: card.instance_id,
    });
  }

  function handleAbilityTarget(card: RuntimeBattleCard) {
    if (!selectedAbilityCard) {
      return;
    }
    const targetMode = selectedAbilityCard.ability_target_mode;

    if (targetMode === "two_cards" || targetMode === "up_to_two_cards") {
      const nextTargets = selectedAbilityTargetIds.includes(card.instance_id)
        ? selectedAbilityTargetIds.filter((targetId) => targetId !== card.instance_id)
        : [...selectedAbilityTargetIds, card.instance_id].slice(0, 2);

      setSelectedAbilityTargetIds(nextTargets);

      if (targetMode === "two_cards" && nextTargets.length === 2) {
        sendAction({
          type: "ability",
          card_id: selectedAbilityCard.instance_id,
          target_type: "card",
          target_ids: nextTargets,
          target_id: nextTargets[0],
        });
        setSelectedAbilityCardId(null);
        setSelectedAbilityTargetIds([]);
      }
      return;
    }

    sendAction({
      type: "ability",
      card_id: selectedAbilityCard.instance_id,
      target_type: "card",
      target_id: card.instance_id,
    });
    setSelectedAbilityCardId(null);
    setSelectedAbilityTargetIds([]);
  }

  function confirmAbilityTargets() {
    if (!selectedAbilityCard || selectedAbilityTargetIds.length === 0) {
      return;
    }
    sendAction({
      type: "ability",
      card_id: selectedAbilityCard.instance_id,
      target_type: "card",
      target_ids: selectedAbilityTargetIds,
      target_id: selectedAbilityTargetIds[0],
    });
    setSelectedAbilityCardId(null);
    setSelectedAbilityTargetIds([]);
  }

  const actionSourceId = roomState?.last_action?.attacker_id ?? roomState?.last_action?.card_id ?? null;
  const actionTargetId = roomState?.last_action?.target_id ?? null;
  const summoningCardId = roomState?.last_action?.summoned_card_id ?? null;

  return (
    <section className="arena-page arena-page--expanded">
      <div className="arena-topbar">
        <div>
          <p className="section-tag">Duelo online</p>
          <h2>Sala de Duelo Southpaw</h2>
        </div>
        <div className="arena-topbar__actions">
          <button className="ghost-button" onClick={copyRoomLink}>
            Copiar link da sala
          </button>
          <button className="ghost-button" onClick={onLeaveRoom}>
            Sair
          </button>
        </div>
      </div>

      <div className="arena-room-meta">
        <span>Sala: {roomId}</span>
        <span>Espectadores: {roomState?.spectators ?? 0}</span>
        <span>Status: {roomState?.completed ? "Encerrada" : roomState?.started ? "Em partida" : "Aguardando duelistas"}</span>
      </div>

      {!displayName ? (
        <div className="join-panel">
          <h3>Entrar na sala</h3>
          <input
            className="arena-input"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Seu nome de duelista"
          />
          <div className="role-toggle">
            <button
              type="button"
              className={preferredRole === "player" ? "role-toggle__active" : ""}
              onClick={() => setPreferredRole("player")}
            >
              Jogador
            </button>
            <button
              type="button"
              className={preferredRole === "spectator" ? "role-toggle__active" : ""}
              onClick={() => setPreferredRole("spectator")}
            >
              Espectador
            </button>
          </div>
          <button className="play-now-button" onClick={connectToRoom}>
            Entrar na batalha
          </button>
        </div>
      ) : null}

      {connectionState !== "connected" && displayName ? (
        <div className="join-panel">
          <h3>Conectando arena...</h3>
          <p>Ligando voce a sala em tempo real.</p>
        </div>
      ) : null}

      {errorMessage ? <p className="arena-error">{errorMessage}</p> : null}

      {roomState ? (
        <div className="arena-layout arena-layout--table-focus arena-layout--expanded">
          <aside className="arena-sidebar arena-sidebar--left">
            <BattleSidebarCard
              title="Duelista superior"
              player={topPlayer}
              maxFieldSize={fieldSize}
              isTimed={isTimedMode}
              isActive={activeSeat === topPlayer?.seat}
              isViewer={viewerSeat === topPlayer?.seat}
              isDamaged={Boolean(topPlayer?.seat && damagedSeats.has(topPlayer.seat))}
              isSpendingElixir={Boolean(topPlayer?.seat && spendingElixirSeat === topPlayer.seat)}
            />

            <BattleSidebarCard
              title="Seu painel"
              player={bottomPlayer}
              maxFieldSize={fieldSize}
              isTimed={isTimedMode}
              isActive={activeSeat === bottomPlayer?.seat}
              isViewer={viewerSeat === bottomPlayer?.seat}
              isDamaged={Boolean(bottomPlayer?.seat && damagedSeats.has(bottomPlayer.seat))}
              isSpendingElixir={Boolean(bottomPlayer?.seat && spendingElixirSeat === bottomPlayer.seat)}
            />
          </aside>

          <div
            className={[
              "arena-board",
              "arena-board--expanded",
              draggedHandSlug ? "arena-board--dragging-card" : "",
              highlightedSlotIndex !== null ? "arena-board--slot-targeted" : "",
            ].join(" ")}
          >
            <div className="arena-round arena-round--board arena-round--expanded">
              <span>{viewerRole === "spectator" ? "Modo espectador" : viewerSeat === activeSeat ? "Seu turno" : "Turno adversario"}</span>
              <span>Rodada {roomState.round_number}</span>
              <span>{roomState.completed ? "Partida encerrada" : "Mesa ativa"}</span>
            </div>

            <section className="opponent-hand-panel">
              <div className="opponent-hand-panel__header">
                <div>
                  <p className="section-tag">Mao adversaria</p>
                  <h3>{topPlayer?.display_name ?? "Duelista superior"}</h3>
                </div>
                <span className="opponent-hand-panel__count">{topPlayer?.hand_count ?? 0} carta(s)</span>
              </div>
              <div className="opponent-hand-strip">
                {buildFacedownCards(topPlayer?.hand_count ?? 0).map((index) => (
                  <div key={`opponent-hand-${index}`} className="opponent-hand-card">
                    <span>Southpaw</span>
                  </div>
                ))}
              </div>
            </section>

            <BattlefieldSection
              title={viewerRole === "spectator" ? "Campo superior" : "Campo adversario"}
              cards={topPlayer?.battlefield ?? []}
              slotCount={fieldSize}
              ghosts={destroyedTopGhosts}
              selectedAttacker={selectedAttacker}
              selectedAbilityCard={selectedAbilityCard}
              selectedAttackerId={selectedAttackerId}
              selectedAbilityCardId={selectedAbilityCardId}
              selectedAbilityTargetIds={selectedAbilityTargetIds}
              actionSourceId={actionSourceId}
              actionTargetId={actionTargetId}
              summoningCardId={summoningCardId}
              damagedCardIds={damagedCardIds}
              viewerRole={viewerRole}
              viewerSeat={viewerSeat}
              activeSeat={activeSeat}
              onAttackTarget={handleAttackTarget}
              onAbilityTarget={handleAbilityTarget}
              onPracticeRemoveEnemyCard={
                isPracticeMode
                  ? (card) => {
                      sendAction({ type: "practice_remove_enemy", card_id: card.instance_id });
                    }
                  : undefined
              }
              isDropEnabled={isPracticeMode && Boolean(practiceSelectedSlug)}
              activeDropSlot={isPracticeMode ? activeDropSlot : null}
              onSlotDragEnter={isPracticeMode ? (slotIndex) => setActiveDropSlot(slotIndex) : undefined}
              onSlotDragLeave={isPracticeMode ? () => setActiveDropSlot(null) : undefined}
              onSlotDrop={
                isPracticeMode
                  ? (slotIndex) => {
                      if (!practiceSelectedSlug) {
                        return;
                      }
                      setPracticeTargetSlotIndex(slotIndex);
                      setActiveDropSlot(slotIndex);
                    }
                  : undefined
              }
              onEmptySlotClick={
                isPracticeMode
                  ? (slotIndex) => {
                      if (!practiceSelectedSlug) {
                        return;
                      }
                      setPracticeTargetSlotIndex(slotIndex);
                      setActiveDropSlot(slotIndex);
                    }
                  : undefined
              }
            />

            {(topPlayer?.battlefield?.length ?? 0) === 0 && selectedAttacker ? (
              <button
                className="direct-attack-button"
                onClick={() =>
                  sendAction({
                    type: "attack",
                    attacker_id: selectedAttacker.instance_id,
                    target_type: "player",
                  })
                }
              >
                Ataque direto
              </button>
            ) : null}

            {(topPlayer?.battlefield?.length ?? 0) === 0 &&
            selectedAbilityCard &&
            ["player", "card_or_player"].includes(selectedAbilityCard.ability_target_mode) ? (
              <button
                className="direct-attack-button"
                onClick={() =>
                  sendAction({
                    type: "ability",
                    card_id: selectedAbilityCard.instance_id,
                    target_type: "player",
                  })
                }
              >
                Usar habilidade no adversario
              </button>
            ) : null}

            {selectedAbilityCard && selectedAbilityCard.ability_target_mode === "up_to_two_cards" ? (
              <button
                className="direct-attack-button"
                disabled={selectedAbilityTargetIds.length === 0}
                onClick={confirmAbilityTargets}
              >
                Confirmar alvos ({selectedAbilityTargetIds.length}/2)
              </button>
            ) : null}

            <BattlefieldSection
              title={viewerRole === "spectator" ? "Campo inferior" : "Seu campo"}
              cards={bottomPlayer?.battlefield ?? []}
              slotCount={fieldSize}
              ghosts={destroyedBottomGhosts}
              selectedAttacker={selectedAttacker}
              selectedAbilityCard={selectedAbilityCard}
              selectedAttackerId={selectedAttackerId}
              selectedAbilityCardId={selectedAbilityCardId}
              selectedAbilityTargetIds={selectedAbilityTargetIds}
              actionSourceId={actionSourceId}
              actionTargetId={actionTargetId}
              summoningCardId={summoningCardId}
              damagedCardIds={damagedCardIds}
              viewerRole={viewerRole}
              viewerSeat={viewerSeat}
              activeSeat={activeSeat}
              onAttackTarget={handleAttackTarget}
              onAbilityTarget={handleAbilityTarget}
              onSelectAttack={(cardId) => {
                setSelectedAbilityCardId(null);
                setSelectedAbilityTargetIds([]);
                setPendingSummonSlug(null);
                setSelectedAttackerId((current) => (current === cardId ? null : cardId));
              }}
              onSelectAbility={(card) => {
                if (["none", "all_cards", "all_enemy_cards"].includes(card.ability_target_mode)) {
                  sendAction({ type: "ability", card_id: card.instance_id });
                  return;
                }
                setSelectedAttackerId(null);
                setSelectedAbilityTargetIds([]);
                setPendingSummonSlug(null);
                setSelectedAbilityCardId((current) => (current === card.instance_id ? null : card.instance_id));
              }}
              onChangePosition={(card) =>
                sendAction({
                  type: "change_position",
                  card_id: card.instance_id,
                  position: card.position === "attack" ? "defense" : "attack",
                })
              }
              isDropEnabled={isMyTurn}
              activeDropSlot={highlightedSlotIndex}
              onSlotDragEnter={(slotIndex) => setActiveDropSlot(slotIndex)}
              onSlotDragLeave={() => setActiveDropSlot(null)}
              onSlotDrop={(slotIndex, event) => {
                const droppedSlug =
                  event.dataTransfer.getData(HAND_DRAG_DATA_KEY) ||
                  event.dataTransfer.getData("text/plain") ||
                  draggedHandSlug;
                if (!droppedSlug) {
                  return;
                }
                openSummonChooser(droppedSlug, slotIndex);
                setDraggedHandSlug(null);
              }}
              onEmptySlotClick={(slotIndex) => {
                if (!pendingSummonSlug || !isMyTurn) {
                  return;
                }
                setPendingSummonSlotIndex(slotIndex);
                setActiveDropSlot(slotIndex);
              }}
            />

            {pendingSummonMonster ? (
              <section className="summon-chooser">
                <div className="summon-chooser__copy">
                  <p className="section-tag">Invocacao</p>
                  <h3>{pendingSummonMonster.name}</h3>
                  <p>
                    {pendingSummonSlotIndex === null
                      ? "Escolha uma zona vazia do seu campo para continuar."
                      : `Escolha como essa carta entra na zona ${pendingSummonSlotIndex + 1}.`}
                  </p>
                </div>
                <div className="summon-chooser__actions">
                  <button className="end-turn-button" disabled={pendingSummonSlotIndex === null} onClick={() => confirmSummon("attack")}>
                    Invocar em ATK
                  </button>
                  <button
                    className="ghost-button summon-chooser__ghost"
                    disabled={pendingSummonSlotIndex === null}
                    onClick={() => confirmSummon("defense")}
                  >
                    Invocar em DEF
                  </button>
                  <button
                    className="ghost-button summon-chooser__ghost"
                    onClick={() => {
                      setPendingSummonSlug(null);
                      setPendingSummonSlotIndex(null);
                      setActiveDropSlot(null);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </section>
            ) : null}

            {isPracticeMode && practiceSelectedMonster ? (
              <section className="summon-chooser summon-chooser--practice">
                <div className="summon-chooser__copy">
                  <p className="section-tag">Treino contra robo</p>
                  <h3>{practiceSelectedMonster.name}</h3>
                  <p>
                    {practiceTargetSlotIndex === null
                      ? "Escolha uma zona vazia no campo inimigo para posicionar essa carta de teste."
                      : `Posicione na zona ${practiceTargetSlotIndex + 1} do campo inimigo.`}
                  </p>
                </div>
                <div className="summon-chooser__actions">
                  <button
                    className="end-turn-button"
                    disabled={practiceTargetSlotIndex === null}
                    onClick={() => confirmPracticeSpawn("attack")}
                  >
                    Inserir em ATK
                  </button>
                  <button
                    className="ghost-button summon-chooser__ghost"
                    disabled={practiceTargetSlotIndex === null}
                    onClick={() => confirmPracticeSpawn("defense")}
                  >
                    Inserir em DEF
                  </button>
                  <button
                    className="ghost-button summon-chooser__ghost"
                    onClick={() => {
                      setPracticeSelectedSlug(null);
                      setPracticeTargetSlotIndex(null);
                      setActiveDropSlot(null);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </section>
            ) : null}

            {viewerRole === "player" ? (
              <div className="hand-command-bar">
                <div className="hand-command-bar__hint">
                  Arraste uma carta da mao para o seu campo ou clique nela para escolher o modo de invocacao.
                </div>
                <div className="hand-command-bar__actions">
                  {isPracticeMode ? (
                    <button className="ghost-button" onClick={() => setPracticeModalOpen(true)}>
                      Abrir selecao do robo
                    </button>
                  ) : null}
                  {viewerSeat === activeSeat ? (
                    <button className="end-turn-button" onClick={() => sendAction({ type: "end_turn" })}>
                      {isPracticeMode ? "Avancar turno de treino" : "Encerrar turno"}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            {viewerRole === "player" ? (
              <BattleHandSection
                title="Cartas na sua mao"
                cards={handCards}
                isActiveTurn={isMyTurn}
                draggedSlug={draggedHandSlug}
                onCardDragStart={(slug) => {
                  setDraggedHandSlug(slug);
                  setPendingSummonSlug(null);
                  setPendingSummonSlotIndex(null);
                }}
                onCardDragEnd={() => {
                  setDraggedHandSlug(null);
                  setActiveDropSlot(null);
                }}
                onCardClick={(slug) => openSummonChooser(slug, null)}
              />
            ) : null}
          </div>

          <aside className="arena-sidebar arena-sidebar--right">
            <div className="status-card status-card--rules">
              <h3>Regras da mesa</h3>
              <p>Voce comeca com 5 cartas na mao e compra 1 carta no inicio de cada novo turno.</p>
              <p>Cartas entram por arrasto na mesa e voce escolhe ATK ou DEF antes da invocacao.</p>
              <p>Ao destruir uma carta inimiga, o agressor recebe metade do custo dela em elixir.</p>
              <p>Quando uma carta sua morre por acao do inimigo, voce sofre 10% da vida maxima dela.</p>
            </div>

            <div className="status-card">
              <h3>Feed de combate</h3>
              <div className="battle-log">
                {roomState.log.map((entry, index) => (
                  <p key={`${index}-${entry}`}>{entry}</p>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {outcomeCopy ? (
        <div className={["battle-outcome-banner", `battle-outcome-banner--${outcomeCopy.tone}`].join(" ")}>
          <div className="battle-outcome-banner__inner">
            <span className="battle-outcome-banner__tag">Resultado do duelo</span>
            <strong>{outcomeCopy.title}</strong>
            <p>{outcomeCopy.subtitle}</p>
          </div>
        </div>
      ) : null}

      {roomState && isPracticeMode && practiceModalOpen ? (
        <div className="practice-modal-backdrop" onClick={() => setPracticeModalOpen(false)}>
          <section className="practice-modal" onClick={(event) => event.stopPropagation()}>
            <div className="practice-modal__header">
              <div>
                <p className="section-tag">Laboratorio do robo</p>
                <h3>Selecione cartas para o campo inimigo</h3>
                <p>
                  {practiceSelectedMonster
                    ? practiceTargetSlotIndex === null
                      ? `Carta escolhida: ${practiceSelectedMonster.name}. Agora selecione uma zona vazia no campo inimigo.`
                      : `Carta escolhida: ${practiceSelectedMonster.name}. Zona alvo: ${practiceTargetSlotIndex + 1}.`
                    : "Escolha uma carta no grimorio abaixo para montar o campo inimigo."}
                </p>
              </div>
              <button className="ghost-button" onClick={() => setPracticeModalOpen(false)}>
                Fechar
              </button>
            </div>

            <div className="practice-lab-grid practice-lab-grid--modal">
              {(monstersQuery.data?.items ?? []).map((monster) => (
                <button
                  key={`practice-modal-${monster.slug}`}
                  type="button"
                  className={[
                    "practice-lab-card",
                    "practice-lab-card--modal",
                    practiceSelectedSlug === monster.slug ? "practice-lab-card--selected" : "",
                  ].join(" ")}
                  onClick={() => {
                    setPracticeSelectedSlug(monster.slug);
                    setPracticeTargetSlotIndex(null);
                    setActiveDropSlot(null);
                  }}
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
                      ability_limit_scope: monster.ability_limit_scope,
                      ability_limit_count: monster.ability_limit_count,
                      ability_target_mode: monster.ability_target_mode,
                      attack: monster.attack,
                      defense: monster.defense,
                      health: monster.health,
                    }}
                  />
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

type LandingPageProps = {
  onCreateRoom: (displayName: string, mode: BattleRoomMode) => void;
};

export function LandingPage({ onCreateRoom }: LandingPageProps) {
  const [displayName, setDisplayName] = useState("");

  return (
    <div className="play-panel">
      <div className="play-panel__copy">
        <p className="hero__eyebrow">Online PvP</p>
        <h2>Monte uma sala em segundos e compartilhe o link para jogar ou assistir.</h2>
        <p>
          Southpaw agora usa um formato de batalha competitivo com 5 minutos por jogador, incremento de
          10 segundos por turno, elixir, campo limitado e habilidades por monstro.
        </p>
      </div>
      <div className="play-panel__actions">
        <input
          className="arena-input"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Seu nome de duelista"
        />
        <button className="play-now-button" onClick={() => onCreateRoom(normalizeName(displayName), "pvp")}>
          JOGAR AGORA
        </button>
        <button className="ghost-button play-panel__secondary" onClick={() => onCreateRoom(normalizeName(displayName), "practice_bot")}>
          TREINAR VS ROBO
        </button>
      </div>
    </div>
  );
}

export async function createBattleRoom(displayName: string, mode: BattleRoomMode = "pvp"): Promise<CreateRoomResponse> {
  return apiPost<CreateRoomResponse, { preferred_role: "player"; mode: BattleRoomMode }>("/battle/rooms", {
    preferred_role: "player",
    mode,
  }).then((response) => {
    const params = new URLSearchParams(window.location.search);
    params.set("room", response.room_id);
    params.set("name", displayName);
    params.set("role", "player");
    window.history.pushState({}, "", `?${params.toString()}`);
    return response;
  });
}
