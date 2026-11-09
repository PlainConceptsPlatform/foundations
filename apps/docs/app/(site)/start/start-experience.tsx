"use client";

import { Button } from "@/components/ui/button";
import { Headphones } from "lucide-react";
import Link from "next/link";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  initialJourney,
  journeyReducer,
  levelReached,
  litIn,
  loadProgress,
  parseHash,
  saveProgress,
  shownStep,
} from "./journey";
import { LayerList } from "./layer-list";
import { HAS_PODCAST, type Lang, nextLayerWith } from "./podcast";
import { PodcastPlayer } from "./podcast-player";
import { StepPanel } from "./step-panel";
import { TOTAL_STEPS, pillarAt } from "./steps";
import { Tower } from "./tower";

const LANG_KEY = "platform-start-podcast-lang";

export function StartExperience() {
  const [state, dispatch] = useReducer(journeyReducer, initialJourney);
  const [restored, setRestored] = useState(false);
  const [listening, setListening] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shown = shownStep(state);

  // The podcast speaks the reader's language when it can: Spanish for a Spanish
  // browser, English otherwise, and whatever they last picked after that.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "en" || saved === "es") return setLang(saved);
    } catch {}
    if (navigator.language.toLowerCase().startsWith("es")) setLang("es");
  }, []);

  function chooseLang(next: Lang) {
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {}
  }

  /** Plays the episode for a layer, or the next one that has audio in the reader's language. */
  function listen(from = state.current) {
    const spoken = nextLayerWith(from, lang) !== undefined ? lang : lang === "en" ? "es" : "en";
    const layer = nextLayerWith(from, spoken) ?? nextLayerWith(0, spoken);
    if (layer === undefined) return;
    if (spoken !== lang) setLang(spoken);
    setListening(layer);
    dispatch({ type: "follow", pillar: layer });
  }

  // Progress lives in localStorage and the piece on screen in the hash, so a link to
  // `/start#2.6` opens that piece. Both are read after hydration: the static export
  // renders the intro, and a client that has neither keeps it.
  useEffect(() => {
    const saved = loadProgress();
    const target = parseHash(window.location.hash);
    let next = { ...initialJourney, ...saved };
    if (target) {
      next = {
        ...next,
        phase: "run",
        built: Math.max(next.built, target.pillar + 1),
        current: target.pillar,
        viewing: target.step,
      };
    } else if (next.phase === "run") {
      next = { ...next, current: next.built - 1 };
    }
    dispatch({ type: "restore", state: next });
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    saveProgress(state);
    const hash =
      state.phase === "run" && shown !== null ? `#${state.current + 1}.${shown + 1}` : "";
    window.history.replaceState(null, "", hash || window.location.pathname);
  }, [state, shown, restored]);

  // Focus follows the panel only when the button that was pressed has gone, which is
  // when the panel changes kind. Within a layer it stays put, and the live region
  // below says what changed.
  const mode =
    state.phase !== "run" ? state.phase : shown === null ? `checkpoint-${state.current}` : "step";
  const lastMode = useRef(mode);
  useEffect(() => {
    if (lastMode.current === mode) return;
    lastMode.current = mode;
    if (restored) headingRef.current?.focus({ preventScroll: true });
  }, [mode, restored]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || state.phase !== "run") return;
      const target = event.target as HTMLElement | null;
      // Arrows inside a form field or the guide dialog belong to them, not to the tower.
      if (target?.closest('input, textarea, select, [contenteditable], [role="dialog"]')) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        dispatch({ type: shown === null ? "nextLayer" : "light" });
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        dispatch({ type: "back" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.phase, shown]);

  const level = levelReached(state);
  const levelText =
    level === 0 ? "Level 0 · no AI" : `Level ${level} · ${pillarAt(level - 1).level}`;
  const lit = state.done.reduce((sum, count) => sum + count, 0);
  const announcement =
    state.phase !== "run"
      ? ""
      : shown === null
        ? `Layer ${state.current + 1} complete`
        : `Piece ${state.current + 1}.${shown + 1}: ${pillarAt(state.current).steps[shown]?.title}${
            shown < litIn(state) ? ", done" : ""
          }`;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-border border-b px-4 py-4 sm:px-6 lg:px-12">
        <span className="text-muted-foreground text-sm">
          {levelText} · <span className="font-semibold text-foreground">{lit}</span> of{" "}
          {TOTAL_STEPS} pieces
        </span>
        <span className="flex-1" />
        {HAS_PODCAST && listening === null && (
          <Button variant="outline" size="sm" onClick={() => listen()}>
            <Headphones aria-hidden />
            Listen
          </Button>
        )}
        <Button variant="outline" size="sm" asChild>
          <Link href="/docs/adopt">Read the docs</Link>
        </Button>
        {state.phase !== "intro" && (
          <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "reset" })}>
            Start over
          </Button>
        )}
      </header>

      {/* Stacked on a phone; the tower beside the panel from lg; the layer list gets its
          own column from xl, where there is room for the tower at full size. */}
      <main className="mx-auto grid w-full max-w-[1440px] flex-1 content-start gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-12 lg:py-12 xl:grid-cols-[280px_minmax(0,1fr)_360px] xl:grid-rows-[auto_1fr]">
        <div className="lg:col-start-1 lg:row-start-1">
          <h1 className="font-bold text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl">
            Your repository, layer by layer
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Each pillar is a layer on top of your code, and each piece you add lights up. The top
            layer, the Platform look and stack, is optional.
          </p>
        </div>

        <div className="lg:col-start-1 lg:row-start-2 xl:col-start-2 xl:row-span-2 xl:row-start-1">
          <Tower
            state={state}
            shown={shown}
            speaking={listening !== null && speaking}
            onPick={(pillar, step) => dispatch({ type: "pick", pillar, step })}
          />
        </div>

        <div className="lg:col-start-2 lg:row-span-3 lg:row-start-1 xl:col-start-3 xl:row-span-2">
          <StepPanel
            state={state}
            shown={shown}
            dispatch={dispatch}
            headingRef={headingRef}
            onListen={HAS_PODCAST ? () => listen(0) : undefined}
          />
        </div>

        <div className="lg:col-start-1 lg:row-start-3 xl:row-start-2">
          <LayerList state={state} onPick={(pillar) => dispatch({ type: "pick", pillar })} />
        </div>
      </main>

      {listening !== null && (
        <>
          {/* Room under the content for the player bar, so it never covers the panel. */}
          <div aria-hidden className="h-48" />
          <PodcastPlayer
            layer={listening}
            lang={lang}
            onLang={chooseLang}
            onLayer={(layer) => listen(layer)}
            onPiece={(pillar, step) => dispatch({ type: "follow", pillar, step })}
            onPlayingChange={setSpeaking}
            onClose={() => setListening(null)}
          />
        </>
      )}

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
