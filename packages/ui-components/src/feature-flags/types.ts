import type { ReactNode } from "react";

/** Off for everyone, on for everyone, or on only for the listed roles and people. */
export type FeatureFlagState = "off" | "on" | "selected";

/** One flaggable section, as the administration API lists it. */
export type FeatureFlag = {
  /** Key from the app's catalog. The identity of the row. */
  key: string;
  /** Display name of the section. */
  name: string;
  description: string;
  state: FeatureFlagState;
  /** Role names that see the section when `state` is `selected`. */
  roles: string[];
  /** Identifiers of the people that see it when `state` is `selected`. */
  people: string[];
  /** Row version. Sent back unchanged on save so the API can refuse a stale write (409). */
  version: string;
  /** ISO date or date-time of the last change. */
  updatedAt?: string;
  /** Who made the last change, already formatted for display. */
  updatedBy?: string;
  /** ISO date (`YYYY-MM-DD`) by which the flag, and so the unfinished section, should be gone. */
  removeBy?: string;
  /** An operator kill switch is active: the section is off whatever the state says. Not editable. */
  forcedOff?: boolean;
  /** The section already has MCP tools. A flag switches them off, so the row says so. */
  hasMcpTools?: boolean;
};

/** What `onSave` receives for the row being saved. */
export type FeatureFlagChange = {
  state: FeatureFlagState;
  roles: string[];
  people: string[];
  /** The `version` of the row the change was made against. */
  version: string;
};

/**
 * Throw this from `onSave` when the API answers 409 (someone else saved the row first), so the
 * row shows `texts.conflictError` instead of the generic `texts.saveError`.
 */
export class FeatureFlagConflictError extends Error {
  constructor(message = "The feature flag was changed by someone else.") {
    super(message);
    this.name = "FeatureFlagConflictError";
  }
}

/** Props handed to `renderPeoplePicker`. */
export type PeoplePickerProps = {
  flag: FeatureFlag;
  /** The identifiers currently chosen in the row. */
  value: readonly string[];
  onChange: (people: string[]) => void;
  disabled: boolean;
  /** Accessible label for the picker (`texts.peopleLabel`). */
  label: string;
};

/** Every string the table shows. The app owns its translations; nothing is hard-coded. */
export type FeatureFlagsAdminTexts = {
  /** Accessible name of the table. */
  tableLabel: string;
  columnSection: string;
  columnState: string;
  columnAccess: string;
  columnUpdated: string;

  stateOff: string;
  stateOn: string;
  stateSelected: string;
  /** Accessible name of a row's state selector, e.g. `State of ${name}`. */
  stateLabel: (name: string) => string;

  /** Access cell when the state is on, e.g. "Everyone". */
  accessEveryone: string;
  /** Access cell when the state is off, e.g. "Nobody". */
  accessNobody: string;
  /** Legend of the role chips, e.g. "Roles that see it". */
  rolesLabel: string;
  /** No role is available to choose from. */
  rolesEmpty: string;
  /** Label of the people editor and of a custom picker, e.g. "People that see it". */
  peopleLabel: string;
  peoplePlaceholder: string;
  addPerson: string;
  /** Accessible name of the remove button of a chosen person. */
  removePerson: (person: string) => string;
  peopleEmpty: string;
  /** Hint when the state is selected but no role and no person is chosen. */
  selectedEmpty: string;

  /** Badge of a row an operator switched off, e.g. "Forced off by configuration". */
  forcedOff: string;
  /** Why the row cannot be edited, shown under the badge. */
  forcedOffHint: string;
  /** Warning on a section that has MCP tools: a flag switches them off. */
  mcpWarning: string;
  /** `removeBy` while it is in the future. `date` is already formatted. */
  removeBy: (date: string) => string;
  /** `removeBy` once it has passed. `date` is already formatted. */
  overdue: (date: string) => string;
  /** Last change. `by` is undefined when the API did not say. */
  updated: (date: string, by: string | undefined) => string;
  /** The row has not changed since it was seeded. */
  neverUpdated: string;

  save: string;
  saving: string;
  saved: string;
  discard: string;
  cancel: string;
  confirm: string;
  confirmTitle: (name: string) => string;
  /** The section goes off for everyone who had it. */
  confirmLoseEveryone: (name: string) => string;
  confirmLoseRoles: (roles: readonly string[]) => string;
  confirmLosePeople: (people: readonly string[]) => string;
  /** Everybody who is not in a chosen role or on the list loses access. */
  confirmLoseUnlisted: string;

  saveError: (name: string) => string;
  conflictError: (name: string) => string;

  loading: string;
  loadError: string;
  retry: string;
  empty: string;
};

export type FeatureFlagsAdminProps = {
  flags: readonly FeatureFlag[];
  /** Role names available for the `selected` state. */
  roles: readonly string[];
  /**
   * Saves one row. Reject to show the row's error state; reject with
   * `FeatureFlagConflictError` for a 409. Resolve once the API has answered, then pass the
   * refreshed `flags` (new `version`): the row leaves its editing state when they arrive.
   */
  onSave: (key: string, change: FeatureFlagChange) => Promise<void>;
  /** The app's save mutation is pending somewhere: every control is disabled. */
  isSaving?: boolean;
  /** The list is being fetched: shows a placeholder. */
  isLoading?: boolean;
  /** The list failed to load: shows an error with the retry button. */
  loadError?: boolean;
  onRetry?: () => void;
  /** The app's own people picker, for example a directory search. A plain editable list by default. */
  renderPeoplePicker?: (props: PeoplePickerProps) => ReactNode;
  texts: FeatureFlagsAdminTexts;
  /** Locale of the dates, e.g. `es`. Default `en`. Dates are shown in UTC, so server and client agree. */
  locale?: string;
  /** The date used to judge `removeBy`. Default: now. Pass it for tests and screenshots. */
  now?: Date | string;
  className?: string;
};
