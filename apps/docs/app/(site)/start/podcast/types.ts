/**
 * The /start podcast: one episode per layer, a conversation between two voices. The
 * script is the source of truth; the audio is generated from it, offline, by
 * `scripts/podcast/generate.mjs`, which also measures where every turn starts so the
 * tower can follow along.
 */

/** Maya hosts and asks what a reader would ask; Leo builds this for a living. */
export type Speaker = "maya" | "leo";

export type Turn = {
  speaker: Speaker;
  /** Written to be spoken: no markdown, no code, nothing a voice would read out as symbols. */
  text: string;
  /** Set on the turn where the conversation reaches a piece: its index in the layer, from 0. */
  piece?: number;
};

export type Episode = {
  /** The layer this episode covers, from 0, as in `PILLARS`. */
  layer: number;
  title: string;
  summary: string;
  turns: Turn[];
};

/** Written by the generator: when each turn starts in the episode's audio file. */
export type EpisodeTiming = {
  src: string;
  duration: number;
  starts: number[];
};
