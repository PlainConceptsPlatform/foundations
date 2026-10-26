import type { TourStorage } from "./types";

export const tourStorageKey = (id: string) => `platform:tour:${id}`;

function defaultStorage(): TourStorage | undefined {
  // Reading localStorage itself can throw (a sandboxed frame, blocked site data).
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Whether this browser already finished or skipped the tour. Unreadable storage answers "no":
 * the tour may then show again, which is better than an error or never showing it.
 */
export function hasSeenTour(
  id: string,
  storage: TourStorage | undefined = defaultStorage(),
): boolean {
  try {
    const seenAt = storage?.getItem?.(tourStorageKey(id));
    return seenAt !== null && seenAt !== undefined;
  } catch {
    return false;
  }
}

/** Records that the tour was finished or skipped. Best effort: a storage failure is ignored. */
export function markTourSeen(
  id: string,
  storage: TourStorage | undefined = defaultStorage(),
  now: Date = new Date(),
): void {
  try {
    storage?.setItem?.(tourStorageKey(id), now.toISOString());
  } catch {
    // Storage may be missing or full; the only cost is seeing the tour again.
  }
}

/** Forgets that the tour was seen, so it can be taken again. Best effort, like recording it. */
export function forgetTour(id: string, storage: TourStorage | undefined = defaultStorage()): void {
  try {
    storage?.removeItem?.(tourStorageKey(id));
  } catch {
    // Storage may be missing; the tour still starts for this page load.
  }
}
