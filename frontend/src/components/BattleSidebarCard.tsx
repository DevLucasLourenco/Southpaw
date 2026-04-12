import type { BattlePlayerState } from "../features/battle/types";

type BattleSidebarCardProps = {
  title: string;
  player: BattlePlayerState | null;
  maxFieldSize: number;
  isTimed: boolean;
  isActive: boolean;
  isViewer: boolean;
  isDamaged: boolean;
  isSpendingElixir: boolean;
};

function formatClock(timeMs: number) {
  const totalSeconds = Math.max(0, Math.floor(timeMs / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function BattleSidebarCard({
  title,
  player,
  maxFieldSize,
  isTimed,
  isActive,
  isViewer,
  isDamaged,
  isSpendingElixir,
}: BattleSidebarCardProps) {
  return (
    <section
      className={[
        "player-sidebar-card",
        isActive ? "player-sidebar-card--active" : "",
        isDamaged ? "player-sidebar-card--damaged" : "",
      ].join(" ")}
    >
      <header className="player-sidebar-card__header">
        <div>
          <p>{title}</p>
          <h3>{player?.display_name ?? "Aguardando duelista"}</h3>
        </div>
        {isViewer ? <span className="player-sidebar-card__viewer-badge">Voce</span> : null}
      </header>

      <div className="player-sidebar-card__grid">
        <div className="player-sidebar-card__metric">
          <span>Vida</span>
          <strong>{player?.health ?? 8000}</strong>
          <div className="player-sidebar-card__bar">
            <div
              className="player-sidebar-card__bar-fill player-sidebar-card__bar-fill--health"
              style={{
                width: `${Math.max(5, ((player?.health ?? 8000) / (player?.max_health ?? 8000)) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div className={["player-sidebar-card__metric", isSpendingElixir ? "player-sidebar-card__metric--spending" : ""].join(" ")}>
          <span>Elixir</span>
          <strong>{player?.elixir ?? 0}</strong>
          <div className="player-sidebar-card__bar">
            <div
              className="player-sidebar-card__bar-fill player-sidebar-card__bar-fill--elixir"
              style={{ width: `${Math.min(100, (player?.elixir ?? 0) * 7)}%` }}
            />
          </div>
          {isSpendingElixir ? <span className="elixir-drop" /> : null}
        </div>

        <div className="player-sidebar-card__metric">
          <span>Tempo</span>
          <strong>{isTimed ? formatClock(player?.time_remaining_ms ?? 0) : "Livre"}</strong>
        </div>

        <div className="player-sidebar-card__metric">
          <span>Mao</span>
          <strong>{player?.hand_count ?? player?.hand.length ?? 0}</strong>
        </div>

        <div className="player-sidebar-card__metric">
          <span>Campo</span>
          <strong>{player?.battlefield.length ?? 0} / {maxFieldSize}</strong>
        </div>

        <div className="player-sidebar-card__metric">
          <span>Grimorio</span>
          <strong>{player?.draw_pile_count ?? 0}</strong>
        </div>

        <div className="player-sidebar-card__metric">
          <span>Cemiterio</span>
          <strong>{player?.graveyard.length ?? 0}</strong>
        </div>
      </div>
    </section>
  );
}
