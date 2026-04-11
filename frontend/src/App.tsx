import { useMemo, useState } from "react";

import worldLoreMarkdown from "../../docs/world-lore.md?raw";

import { MonsterCard } from "./components/MonsterCard";
import { BattleArena, LandingPage, createBattleRoom } from "./components/BattleArena";
import { useMonstersQuery } from "./features/monsters/queries";

type GrimoirePage = {
  id: string;
  chapter: string;
  title: string;
  summary: string;
  accent: string;
  blocks: Array<
    | { type: "paragraph"; content: string }
    | { type: "quote"; content: string }
    | { type: "list"; items: string[] }
  >;
};

function parseMetadata(rawMetadata: string) {
  const metadata: Record<string, string> = {};
  rawMetadata
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) {
        return;
      }
      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      metadata[key] = value;
    });
  return metadata;
}

function parseBlocks(content: string): GrimoirePage["blocks"] {
  return content
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith(">")) {
        return {
          type: "quote" as const,
          content: block.replace(/^>\s?/gm, " ").trim(),
        };
      }

      if (block.split(/\r?\n/).every((line) => line.trim().startsWith("- "))) {
        return {
          type: "list" as const,
          items: block
            .split(/\r?\n/)
            .map((line) => line.trim().replace(/^-\s*/, "").trim())
            .filter(Boolean),
        };
      }

      return {
        type: "paragraph" as const,
        content: block.replace(/\n+/g, " ").trim(),
      };
    });
}

function parseGrimoirePages(markdown: string): GrimoirePage[] {
  const pagePattern = /<!--\s*GRIMOIRE_PAGE\s*([\s\S]*?)-->\s*([\s\S]*?)\s*<!--\s*\/GRIMOIRE_PAGE\s*-->/g;
  const matches = Array.from(markdown.matchAll(pagePattern));

  return matches.map((match, index) => {
    const metadata = parseMetadata(match[1] ?? "");
    return {
      id: metadata.id ?? `pagina-${index + 1}`,
      chapter: metadata.chapter ?? `Pagina ${index + 1}`,
      title: metadata.title ?? `Capitulo ${index + 1}`,
      summary: metadata.summary ?? "",
      accent: metadata.accent ?? "ouro-antigo",
      blocks: parseBlocks(match[2] ?? ""),
    };
  });
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function App() {
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [grimoirePageIndex, setGrimoirePageIndex] = useState(0);
  const monstersQuery = useMonstersQuery();
  const roomId = useMemo(() => new URLSearchParams(window.location.search).get("room"), []);
  const grimoirePages = useMemo(() => parseGrimoirePages(worldLoreMarkdown), []);
  const currentGrimoirePage = grimoirePages[grimoirePageIndex] ?? null;

  async function handleCreateRoom(displayName: string) {
    setCreatingRoom(true);
    try {
      await createBattleRoom(displayName);
      window.location.reload();
    } finally {
      setCreatingRoom(false);
    }
  }

  function leaveRoom() {
    window.history.pushState({}, "", window.location.pathname);
    window.location.reload();
  }

  if (roomId) {
    return (
      <main className="app-shell">
        <BattleArena roomId={roomId} onLeaveRoom={leaveRoom} />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="hero hero--grimoire">
        <div className="hero__intro">
          <p className="hero__eyebrow">Southpaw</p>
          <h1>Abra o grimorio de Asterra Quebrada.</h1>
          <p className="hero__copy">
            O prologo do mundo agora nasce do proprio documento de lore. Cada pagina revela uma parte da queda,
            das faccoes e do selo enterrado sob o continente.
          </p>
        </div>

        {currentGrimoirePage ? (
          <div className="grimoire">
            <article className={`grimoire__page grimoire__page--active grimoire__page--${currentGrimoirePage.accent}`}>
              <div className="grimoire__page-header">
                <p className="section-tag">{currentGrimoirePage.chapter}</p>
                <span className="grimoire__counter">
                  {String(grimoirePageIndex + 1).padStart(2, "0")} / {String(grimoirePages.length).padStart(2, "0")}
                </span>
              </div>
              <h2>{currentGrimoirePage.title}</h2>
              {currentGrimoirePage.summary ? <p className="grimoire__summary">{currentGrimoirePage.summary}</p> : null}
              <div className="grimoire__body">
                {currentGrimoirePage.blocks.map((block, index) => {
                  if (block.type === "quote") {
                    return <blockquote key={`${currentGrimoirePage.id}-quote-${index}`}>{renderInlineMarkdown(block.content)}</blockquote>;
                  }
                  if (block.type === "list") {
                    return (
                      <ul key={`${currentGrimoirePage.id}-list-${index}`} className="grimoire__list">
                        {block.items.map((item) => (
                          <li key={item}>{renderInlineMarkdown(item)}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={`${currentGrimoirePage.id}-paragraph-${index}`}>{renderInlineMarkdown(block.content)}</p>;
                })}
              </div>
            </article>

            <aside className="grimoire__rail">
              <div className="grimoire__index">
                {grimoirePages.map((page, index) => (
                  <button
                    key={page.id}
                    type="button"
                    className={
                      index === grimoirePageIndex
                        ? "grimoire__index-button grimoire__index-button--active"
                        : "grimoire__index-button"
                    }
                    onClick={() => setGrimoirePageIndex(index)}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{page.title}</strong>
                    <small>{page.summary}</small>
                  </button>
                ))}
              </div>

              <div className="grimoire__actions">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setGrimoirePageIndex((current) => Math.max(0, current - 1))}
                  disabled={grimoirePageIndex === 0}
                >
                  Pagina anterior
                </button>
                <button
                  type="button"
                  className="play-now-button grimoire__next-button"
                  onClick={() => setGrimoirePageIndex((current) => Math.min(grimoirePages.length - 1, current + 1))}
                  disabled={grimoirePageIndex === grimoirePages.length - 1}
                >
                  Virar pagina
                </button>
              </div>
            </aside>
          </div>
        ) : null}
      </section>

      <LandingPage onCreateRoom={handleCreateRoom} />
      {creatingRoom ? <p className="arena-inline-note">Criando sala e preparando arena...</p> : null}

      <section className="catalogue-section">
        <div className="catalogue-section__header">
          <div>
            <p className="section-tag">Catalogo de Monstros</p>
            <h2>Primeiro grimorio invocado do banco de dados</h2>
          </div>
          <span className="catalogue-badge">{monstersQuery.data?.total ?? 0} cartas</span>
        </div>

        {monstersQuery.isLoading ? <p>Carregando monstros...</p> : null}
        {monstersQuery.isError ? <p>Nao foi possivel carregar o catalogo agora.</p> : null}

        <div className="monster-grid">
          {monstersQuery.data?.items.map((monster) => (
            <MonsterCard key={monster.id} monster={monster} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
