/**
 * The /start podcast: one NotebookLM audio overview per layer, in English and in
 * Spanish, generated from the guides on this page. `scripts/podcast/import_episode.py`
 * re-encodes each download, transcribes it locally for the subtitles, and records when
 * the hosts announce each piece, which is how the tower follows the conversation.
 */
import data from "./episodes.json";

export type Lang = "en" | "es";

export type Segment = { start: number; end: number; text: string };

export type Episode = {
  src: string;
  /** The subtitles, kept out of the page and fetched by `loadLines` when someone listens. */
  transcript: string;
  duration: number;
  /** When each piece starts, in order; `estimated` when the hosts didn't announce it. */
  pieces: { piece: number; start: number; estimated?: boolean }[];
};

const EPISODES = data as Partial<Record<Lang, Partial<Record<string, Episode>>>>;

export const LANGS: { id: Lang; label: string; short: string }[] = [
  { id: "en", label: "English", short: "EN" },
  { id: "es", label: "Español", short: "ES" },
];

const TITLES: Record<Lang, string[]> = {
  en: [
    "The repository understands an agent",
    "Agents work without you",
    "You know whether it works",
    "The Platform look and stack",
  ],
  es: [
    "El repositorio entiende a un agente",
    "Los agentes trabajan sin ti",
    "Sabes si funciona",
    "El aspecto y el stack de Platform",
  ],
};

export type PlayableEpisode = Episode & { layer: number; lang: Lang; title: string };

export function episodeFor(layer: number, lang: Lang): PlayableEpisode | undefined {
  const episode = EPISODES[lang]?.[String(layer + 1)];
  if (!episode) return undefined;
  return { ...episode, layer, lang, title: TITLES[lang][layer] ?? "" };
}

const transcripts = new Map<string, Promise<Segment[]>>();

/** The episode's subtitles as whole lines, fetched once per episode. */
export function loadLines(episode: Episode): Promise<Segment[]> {
  let lines = transcripts.get(episode.transcript);
  if (!lines) {
    lines = fetch(episode.transcript)
      .then((response) => (response.ok ? (response.json() as Promise<Segment[]>) : []))
      .then(toLines)
      .catch(() => []);
    transcripts.set(episode.transcript, lines);
  }
  return lines;
}

const MAX_LINE = 110;

/**
 * Whisper cuts wherever the voice pauses, often mid-sentence. Subtitles read better as
 * whole sentences, so consecutive pieces join until a sentence ends or the line is full.
 */
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

/** Languages this layer has an episode in. */
export function langsFor(layer: number): Lang[] {
  return LANGS.map((l) => l.id).filter((lang) => episodeFor(layer, lang));
}

/** The first layer at or after `from` with an episode in `lang`, if any. */
export function nextLayerWith(from: number, lang: Lang): number | undefined {
  return [0, 1, 2, 3].find((layer) => layer >= from && episodeFor(layer, lang));
}

export const HAS_PODCAST = LANGS.some((l) => nextLayerWith(0, l.id) !== undefined);
