"use client";

import {
  FeatureFlagConflictError,
  FeatureFlagsAdmin,
  FeatureGate,
  FeatureGuard,
  FeatureProvider,
} from "@plainconceptsplatform/ui-components/feature-flags";
import type {
  FeatureFlag,
  FeatureFlagChange,
  FeatureFlagsAdminTexts,
} from "@plainconceptsplatform/ui-components/feature-flags";
import { useState } from "react";

// A fixed "today", so the overdue indicator and the dates render the same on the server, in the
// browser and in screenshots. A real app omits `now`.
const NOW = "2026-10-30";

const ROLES = ["Admin", "Manager", "Finance", "Employee"];

const INITIAL: FeatureFlag[] = [
  {
    key: "claims",
    name: "Claims",
    description: "Expense claims. A new section: shipped off.",
    state: "off",
    roles: [],
    people: [],
    version: "1",
    removeBy: "2027-01-31",
  },
  {
    key: "projects",
    name: "Projects",
    description: "Project list and detail. On for everyone.",
    state: "on",
    roles: [],
    people: [],
    version: "1",
    updatedAt: "2026-10-12T09:30:00Z",
    updatedBy: "Ana Ruiz",
    removeBy: "2027-03-31",
  },
  {
    key: "reports",
    name: "Reports",
    description: "A beta section, on for selected roles and people.",
    state: "selected",
    roles: ["Manager", "Finance"],
    people: ["lucia@example.com"],
    version: "3",
    updatedAt: "2026-10-20T16:05:00Z",
    updatedBy: "Ana Ruiz",
    removeBy: "2027-02-28",
  },
  {
    key: "finance",
    name: "Finance",
    description: "Payroll and budgets. An operator switched it off.",
    state: "on",
    roles: [],
    people: [],
    version: "2",
    updatedAt: "2026-09-02T08:00:00Z",
    updatedBy: "Mario Gil",
    removeBy: "2027-01-15",
    forcedOff: true,
  },
  {
    key: "calculators",
    name: "Calculators",
    description: "Already has MCP tools: a flag would switch them off.",
    state: "on",
    roles: [],
    people: [],
    version: "1",
    removeBy: "2027-04-30",
    hasMcpTools: true,
  },
  {
    key: "audit",
    name: "Audit",
    description: "Past its removal date: finish the section and delete the flag.",
    state: "on",
    roles: [],
    people: [],
    version: "4",
    updatedAt: "2026-05-04T10:00:00Z",
    updatedBy: "Mario Gil",
    removeBy: "2026-08-31",
  },
];

const TEXTS: FeatureFlagsAdminTexts = {
  tableLabel: "Section feature flags",
  columnSection: "Section",
  columnState: "State",
  columnAccess: "Who sees it",
  columnUpdated: "Last change",
  stateOff: "Off",
  stateOn: "On for everyone",
  stateSelected: "Selected roles and people",
  stateLabel: (name) => `State of ${name}`,
  accessEveryone: "Everyone",
  accessNobody: "Nobody",
  rolesLabel: "Roles",
  rolesEmpty: "There are no roles to choose from.",
  peopleLabel: "People",
  peoplePlaceholder: "name@example.com",
  addPerson: "Add",
  removePerson: (person) => `Remove ${person}`,
  peopleEmpty: "No people added.",
  selectedEmpty: "Nobody sees this section until you choose a role or add a person.",
  forcedOff: "Forced off by configuration",
  forcedOffHint: "An operator switched this section off. It cannot be edited here.",
  mcpWarning:
    "This section has MCP tools. A flag switches them off for every caller, administrators included, until the flag is deleted.",
  removeBy: (date) => `Remove by ${date}`,
  overdue: (date) => `Overdue: remove by ${date}`,
  updated: (date, by) => (by ? `${date} by ${by}` : date),
  neverUpdated: "Never changed",
  save: "Save",
  saving: "Saving…",
  saved: "Saved",
  discard: "Discard",
  cancel: "Cancel",
  confirm: "Save and remove access",
  confirmTitle: (name) => `Remove access to ${name}?`,
  confirmLoseEveryone: (name) => `Everyone loses access to ${name}.`,
  confirmLoseRoles: (roles) => `These roles lose access: ${roles.join(", ")}.`,
  confirmLosePeople: (people) => `These people lose access: ${people.join(", ")}.`,
  confirmLoseUnlisted: "Everyone outside the chosen roles and the list loses access.",
  saveError: (name) => `${name} could not be saved. Try again.`,
  conflictError: (name) => `Someone else changed ${name}. Reload the list and try again.`,
  loading: "Loading sections",
  loadError: "The sections could not be loaded.",
  retry: "Try again",
  empty: "There are no sections with a feature flag.",
};

type View = "table" | "loading" | "empty" | "error";

export function FeatureFlagsDemo() {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL);
  const [view, setView] = useState<View>("table");
  const [failing, setFailing] = useState(false);
  const [viewer, setViewer] = useState("Employee");

  const onSave = async (key: string, change: FeatureFlagChange) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (failing) throw new FeatureFlagConflictError();
    setFlags((current) =>
      current.map((flag) =>
        flag.key === key
          ? {
              ...flag,
              ...change,
              version: String(Number(flag.version) + 1),
              updatedAt: `${NOW}T12:00:00Z`,
              updatedBy: "You",
            }
          : flag,
      ),
    );
  };

  // What the API's `GET /me/features` would answer for the person chosen below.
  const features = flags
    .filter(
      (flag) =>
        !flag.forcedOff &&
        (flag.state === "on" ||
          (flag.state === "selected" &&
            (flag.roles.includes(viewer) || flag.people.includes("lucia@example.com")))),
    )
    .map((flag) => flag.key);

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          View
          <select
            className="h-8 rounded-md border bg-background px-2"
            value={view}
            onChange={(event) => setView(event.target.value as View)}
          >
            <option value="table">Table</option>
            <option value="loading">Loading</option>
            <option value="empty">Empty</option>
            <option value="error">Load error</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={failing}
            onChange={(event) => setFailing(event.target.checked)}
          />
          Make the next saves fail (conflict)
        </label>
      </div>

      <FeatureFlagsAdmin
        flags={view === "empty" ? [] : flags}
        roles={ROLES}
        onSave={onSave}
        isLoading={view === "loading"}
        loadError={view === "error"}
        onRetry={() => setView("table")}
        texts={TEXTS}
        now={NOW}
      />

      <section className="flex flex-col gap-3">
        <h3 className="m-0 text-sm font-semibold">What the app does with the answer</h3>
        <label className="flex items-center gap-2 text-sm">
          Signed in as
          <select
            className="h-8 rounded-md border bg-background px-2"
            value={viewer}
            onChange={(event) => setViewer(event.target.value)}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        <FeatureProvider features={features}>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0 text-sm">
            {flags.map((flag) => (
              <FeatureGate key={flag.key} feature={flag.key}>
                <li className="rounded-md border bg-card px-3 py-1">{flag.name}</li>
              </FeatureGate>
            ))}
          </ul>
          <div className="rounded-md border p-3 text-sm">
            <FeatureGuard
              feature="reports"
              notFound={<p className="m-0 text-muted-foreground">404: page not found.</p>}
              loading={<p className="m-0">Loading…</p>}
            >
              <p className="m-0">The Reports page.</p>
            </FeatureGuard>
          </div>
        </FeatureProvider>
      </section>
    </div>
  );
}
