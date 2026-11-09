/**
 * The case-study podcast, shaped like the /start one: one "episode" per chapter,
 * in English and Spanish, generated with NotebookLM. Until the NotebookLM audio is
 * produced, each episode has no `src` and the player runs a timed guided preview
 * with the identical chrome. Filling `src`, `transcript`, `duration` and `pieces`
 * (see episodes.json) turns the same player onto real audio, no UI change needed.
 */
import episodeData from "./episodes.json";

export type Lang = "en" | "es";

export type Segment = { start: number; end: number; text: string };

export type Piece = { piece: number; start: number; estimated?: boolean };

export type Episode = {
  /** Empty until the NotebookLM audio exists; the player then runs a guided preview. */
  src: string;
  /** Subtitles path, fetched by `loadLines` when someone listens; empty until produced. */
  transcript: string;
  duration: number;
  title: string;
  /** When each follow-along point starts; the guided preview uses a single point at 0. */
  pieces: Piece[];
};

export type PlayableEpisode = Episode & { index: number; lang: Lang };

export const LANGS: { id: Lang; label: string; short: string }[] = [
  { id: "en", label: "English", short: "EN" },
  { id: "es", label: "Español", short: "ES" },
];

export type EpisodeSpec = {
  title: string;
  src?: string;
  transcript?: string;
  duration?: number;
  pieces?: Piece[];
};

export type Podcast = {
  count: number;
  /** True once a real audio exists in some language; mirrors /start's HAS_PODCAST. */
  any: boolean;
  episodeFor: (index: number, lang: Lang) => PlayableEpisode | undefined;
  langsFor: (index: number) => Lang[];
  /** The first episode at or after `from` that is defined in `lang`, if any. */
  nextWith: (from: number, lang: Lang) => number | undefined;
};

/** Build the accessors the shared player needs from a per-language list of chapters. */
export function createPodcast(
  byLang: Partial<Record<Lang, EpisodeSpec[]>>,
  caseId: string,
): Podcast {
  const recordings = (
    episodeData as Record<string, Partial<Record<Lang, Record<string, Partial<EpisodeSpec>>>>>
  )[caseId];
  const langs: Lang[] = ["en", "es"];
  const table: Partial<Record<Lang, Episode[]>> = {};
  let count = 0;

  for (const lang of langs) {
    const list = byLang[lang];
    if (!list) continue;
    count = Math.max(count, list.length);
    table[lang] = list.map((preview, index) => {
      const spec = { ...preview, ...recordings?.[lang]?.[String(index + 1)] };
      return {
        src: spec.src ?? "",
        transcript: spec.transcript ?? "",
        duration: spec.duration ?? 0,
        title: spec.title,
        pieces: spec.pieces ?? [{ piece: 0, start: 0 }],
      };
    });
  }

  function episodeFor(index: number, lang: Lang): PlayableEpisode | undefined {
    const row = table[lang]?.[index];
    if (!row) return undefined;
    return { ...row, index, lang };
  }

  function langsFor(index: number): Lang[] {
    return langs.filter((lang) => episodeFor(index, lang) !== undefined);
  }

  function nextWith(from: number, lang: Lang): number | undefined {
    const list = table[lang] ?? [];
    for (let i = from; i < list.length; i += 1) {
      if (list[i]) return i;
    }
    return undefined;
  }

  const any = langs.some((lang) => (table[lang] ?? []).some((ep) => ep.src));

  return { count, any, episodeFor, langsFor, nextWith };
}

const transcripts = new Map<string, Promise<Segment[]>>();

/** The episode's subtitles as whole lines, fetched once per episode (real-audio path). */
export function loadLines(transcript: string): Promise<Segment[]> {
  let lines = transcripts.get(transcript);
  if (!lines) {
    lines = fetch(transcript)
      .then((response) => (response.ok ? (response.json() as Promise<Segment[]>) : []))
      .then(toLines)
      .catch(() => []);
    transcripts.set(transcript, lines);
  }
  return lines;
}

const MAX_LINE = 110;

/** Whisper cuts on pauses, often mid-sentence; join to whole sentences for subtitles. */
function toLines(segments: Segment[]): Segment[] {
  const lines: Segment[] = [];
  for (const segment of segments) {
    const last = lines.at(-1);
    const ended = last ? /[.?!…]["”’)]?$/.test(last.text) : true;
    if (last && !ended && last.text.length + segment.text.length + 1 <= MAX_LINE) {
      lines[lines.length - 1] = { ...last, end: segment.end, text: `${last.text} ${segment.text}` };
    } else {
      lines.push({ ...segment });
    }
  }
  return lines;
}
