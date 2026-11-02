import { EPISODE_1 } from "./episode-1";
import { EPISODE_2 } from "./episode-2";
import { EPISODE_3 } from "./episode-3";
import { EPISODE_4 } from "./episode-4";
import { TIMINGS } from "./timings.generated";
import type { Episode, EpisodeTiming } from "./types";

const EPISODES: Episode[] = [EPISODE_1, EPISODE_2, EPISODE_3, EPISODE_4];

export type PlayableEpisode = Episode & { number: number; timing: EpisodeTiming };

/** An episode only plays once its audio has been generated; until then it is not offered. */
export function episodeFor(layer: number): PlayableEpisode | undefined {
  const episode = EPISODES[layer];
  const timing = TIMINGS[layer + 1];
  if (!episode || !timing || timing.starts.length !== episode.turns.length) return undefined;
  return { ...episode, number: layer + 1, timing };
}

export const HAS_PODCAST = EPISODES.some((_, layer) => episodeFor(layer));

export const SPEAKERS = { maya: "Maya", leo: "Leo" } as const;

export type { Episode, EpisodeTiming, Turn } from "./types";
