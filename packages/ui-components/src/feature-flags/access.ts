import type { FeatureFlagState } from "./types";

type Choice = { state: FeatureFlagState; roles: readonly string[]; people: readonly string[] };

/** Who stops seeing a section when a change is saved. */
export type AccessLoss = {
  /** The section goes off for everyone who had it. */
  everyone: boolean;
  /** People who hold none of the chosen roles and are not listed. Only after "on for everyone". */
  unlisted: boolean;
  roles: string[];
  people: string[];
};

const without = (from: readonly string[], remove: readonly string[]) =>
  from.filter((item) => !remove.includes(item));

/**
 * What a change takes away, or `null` when it only gives access or changes nothing. The
 * confirmation step is shown only when this is not `null`.
 */
export function accessLoss(
  previous: Choice,
  next: Choice,
  availableRoles: readonly string[],
): AccessLoss | null {
  if (previous.state === "off" || next.state === "on") return null;

  if (previous.state === "on") {
    if (next.state === "off") return { everyone: true, unlisted: false, roles: [], people: [] };
    return {
      everyone: false,
      unlisted: true,
      roles: without(availableRoles, next.roles),
      people: [],
    };
  }

  // previous is "selected"
  const roles = next.state === "off" ? [...previous.roles] : without(previous.roles, next.roles);
  const people =
    next.state === "off" ? [...previous.people] : without(previous.people, next.people);
  if (roles.length === 0 && people.length === 0) return null;
  return { everyone: false, unlisted: false, roles, people };
}

const sameSet = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((item) => b.includes(item));

/** Whether the row differs from what is saved. Roles and people only count under `selected`. */
export function isDirty(saved: Choice, draft: Choice): boolean {
  if (saved.state !== draft.state) return true;
  if (draft.state !== "selected") return false;
  return !sameSet(saved.roles, draft.roles) || !sameSet(saved.people, draft.people);
}

/** Day (`YYYY-MM-DD`) of a date, in UTC. Falls back to today when the value is not a date. */
function dayOf(value: Date | string | undefined): string {
  const date = value === undefined ? new Date() : new Date(value);
  return (Number.isNaN(date.getTime()) ? new Date() : date).toISOString().slice(0, 10);
}

/** The `removeBy` day has passed. The day itself is not yet overdue. */
export function isOverdue(removeBy: string, now: Date | string | undefined): boolean {
  return removeBy.slice(0, 10) < dayOf(now);
}

export function formatDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(date);
}
