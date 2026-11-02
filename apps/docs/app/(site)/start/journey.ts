import { PILLARS, pillarAt } from "./steps";

export type Phase = "intro" | "run" | "end";

export type JourneyState = {
  phase: Phase;
  /** How many layers sit on the tower; a layer drops in the first time it is reached. */
  built: number;
  current: number;
  /** Pieces lit per layer. Lighting is in order, so a count is enough. */
  done: number[];
  /** A piece picked out of order; null follows the next unlit one. */
  viewing: number | null;
  /** Pieces lit together by a shortcut light one after another from `from`. */
  cascade: { pillar: number; from: number } | null;
};

export type JourneyAction =
  | { type: "start" }
  | { type: "light" }
  | { type: "lightLayer" }
  | { type: "back" }
  | { type: "nextLayer" }
  | { type: "finish" }
  | { type: "pick"; pillar: number; step?: number }
  /** Like pick, but builds the layer first: the podcast can talk ahead of the reader. */
  | { type: "follow"; pillar: number; step?: number }
  | { type: "restore"; state: JourneyState }
  | { type: "reset" };

export const initialJourney: JourneyState = {
  phase: "intro",
  built: 0,
  current: 0,
  done: PILLARS.map(() => 0),
  viewing: null,
  cascade: null,
};

const LAST = PILLARS.length - 1;
const sizeOf = (pillar: number) => pillarAt(pillar).steps.length;

export function litIn(state: JourneyState, pillar = state.current) {
  return state.done[pillar] ?? 0;
}

export function isLayerComplete(state: JourneyState, pillar = state.current) {
  return litIn(state, pillar) >= sizeOf(pillar);
}

/** The piece the panel shows, or null at a layer's checkpoint. */
export function shownStep(state: JourneyState): number | null {
  if (state.viewing !== null) return state.viewing;
  return isLayerComplete(state) ? null : litIn(state);
}

/** Layers complete from the bottom up: a later layer does not count while one below is open. */
export function levelReached(state: JourneyState) {
  const open = state.done.findIndex((count, pillar) => count < sizeOf(pillar));
  return open === -1 ? PILLARS.length : open;
}

export function journeyReducer(state: JourneyState, action: JourneyAction): JourneyState {
  switch (action.type) {
    case "start":
      return { ...state, phase: "run", built: Math.max(state.built, 1), current: 0, viewing: null };

    case "light": {
      const step = shownStep(state);
      if (step === null) return state;
      const lit = litIn(state);
      if (step < lit) {
        const next = step + 1;
        return { ...state, viewing: next < lit ? next : null, cascade: null };
      }
      const done = state.done.slice();
      done[state.current] = step + 1;
      const cascade = step > lit ? { pillar: state.current, from: lit } : null;
      return { ...state, done, viewing: null, cascade };
    }

    case "lightLayer": {
      const done = state.done.slice();
      const from = litIn(state);
      done[state.current] = sizeOf(state.current);
      return { ...state, done, viewing: null, cascade: { pillar: state.current, from } };
    }

    case "back": {
      const step = shownStep(state) ?? sizeOf(state.current);
      return step > 0 ? { ...state, viewing: step - 1, cascade: null } : state;
    }

    case "nextLayer": {
      if (state.current >= LAST) return { ...state, phase: "end", viewing: null, cascade: null };
      const current = state.current + 1;
      return {
        ...state,
        current,
        built: Math.max(state.built, current + 1),
        viewing: null,
        cascade: null,
      };
    }

    case "finish":
      return { ...state, phase: "end", viewing: null, cascade: null };

    case "pick":
      if (action.pillar >= state.built) return state;
      return {
        ...state,
        phase: "run",
        current: action.pillar,
        viewing: action.step ?? null,
        cascade: null,
      };

    case "follow":
      return {
        ...state,
        phase: "run",
        built: Math.max(state.built, action.pillar + 1),
        current: action.pillar,
        viewing: action.step ?? null,
        cascade: null,
      };

    case "restore":
      return action.state;

    case "reset":
      return initialJourney;
  }
}

const STORAGE_KEY = "platform-start-v1";

/** Only the progress is kept; what is on screen comes from the URL hash. */
export function loadProgress(): Pick<JourneyState, "phase" | "built" | "done"> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<JourneyState>;
    const done = PILLARS.map((pillar, i) =>
      Math.min(Math.max(Number(saved.done?.[i]) || 0, 0), pillar.steps.length),
    );
    const built = Math.min(Math.max(Number(saved.built) || 0, 0), PILLARS.length);
    const phase = saved.phase === "end" ? "end" : built > 0 ? "run" : "intro";
    return { phase, built, done };
  } catch {
    return null;
  }
}

export function saveProgress(state: JourneyState) {
  try {
    const { phase, built, done } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ phase, built, done }));
  } catch {
    // Private windows and blocked storage: the journey still works, it just starts over.
  }
}

/** `#1.7` is layer 1, piece 7, both counted from one as the page shows them. */
export function parseHash(hash: string) {
  const match = /^#(\d+)\.(\d+)$/.exec(hash);
  if (!match) return null;
  const pillar = Number(match[1]) - 1;
  const step = Number(match[2]) - 1;
  if (pillar < 0 || pillar > LAST || step < 0 || step >= sizeOf(pillar)) return null;
  return { pillar, step };
}
