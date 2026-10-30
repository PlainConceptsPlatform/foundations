"use client";

import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { cn } from "../lib/utils";
import { type AccessLoss, accessLoss, formatDate, isDirty, isOverdue } from "./access";
import {
  type FeatureFlag,
  FeatureFlagConflictError,
  type FeatureFlagState,
  type FeatureFlagsAdminProps,
  type FeatureFlagsAdminTexts,
  type PeoplePickerProps,
} from "./types";

// ---------------------------------------------------------------------------
// Administration table for section feature flags. Pure UI: the app owns its API
// client, its people picker and its strings. Native elements only (a select for the
// state, checkbox chips for the roles, an inline panel for the confirmation), styled
// with the theme tokens, so the package takes no new dependency.
//
// Every class that touches a native control sets what Tailwind preflight would set
// (`border-solid`, `font-sans`, `box-border`, `text-left`), so it also renders in an
// app that does not ship preflight.
// ---------------------------------------------------------------------------

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const MOTION = "transition-colors duration-150 ease-out";

const FIELD = cn(
  "box-border h-9 rounded-md border border-solid border-input bg-background px-2 font-sans text-sm text-foreground",
  "disabled:cursor-not-allowed disabled:opacity-50",
  MOTION,
  FOCUS,
);

const BUTTON = cn(
  "inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-solid px-3 font-sans text-sm font-medium",
  "disabled:cursor-not-allowed disabled:opacity-50",
  MOTION,
  FOCUS,
);
const BUTTON_PRIMARY = cn(
  BUTTON,
  "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
);
const BUTTON_SECONDARY = cn(
  BUTTON,
  "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
);

const BADGE =
  "inline-flex items-center whitespace-nowrap rounded-full border border-solid px-2 py-0.5 text-xs font-medium text-foreground";

const FIELDSET = "m-0 min-w-0 border-0 p-0";
const LEGEND = "mb-1 p-0 text-xs font-medium text-muted-foreground";

type Draft = { state: FeatureFlagState; roles: string[]; people: string[] };
type Status = "idle" | "saving" | "saved" | "error" | "conflict";

const draftOf = (flag: FeatureFlag): Draft => ({
  state: flag.state,
  roles: [...flag.roles],
  people: [...flag.people],
});

/** Content signature of what is saved, so a refetch with equal content does not reset the draft. */
const signatureOf = (flag: FeatureFlag) =>
  JSON.stringify([flag.version, flag.state, flag.roles, flag.people, flag.forcedOff === true]);

// --- people --------------------------------------------------------------------

function DefaultPeopleEditor({
  value,
  onChange,
  disabled,
  label,
  texts,
}: PeoplePickerProps & { texts: FeatureFlagsAdminTexts }) {
  const [text, setText] = useState("");

  const add = () => {
    const next = text.trim();
    if (next === "") return;
    if (!value.includes(next)) onChange([...value, next]);
    setText("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    add();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          disabled={disabled}
          placeholder={texts.peoplePlaceholder}
          aria-label={label}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          className={cn(FIELD, "min-w-0 flex-1")}
        />
        <button
          type="button"
          disabled={disabled || text.trim() === ""}
          onClick={add}
          className={BUTTON_SECONDARY}
        >
          {texts.addPerson}
        </button>
      </div>
      {value.length === 0 ? (
        <p className="m-0 text-xs text-muted-foreground">{texts.peopleEmpty}</p>
      ) : (
        <ul className="m-0 flex list-none flex-wrap gap-1 p-0">
          {value.map((person) => (
            <li
              key={person}
              className="inline-flex items-center gap-1 rounded-full border border-solid border-input bg-background py-0.5 pr-1 pl-3 text-xs text-foreground"
            >
              <span>{person}</span>
              <button
                type="button"
                disabled={disabled}
                aria-label={texts.removePerson(person)}
                onClick={() => onChange(value.filter((item) => item !== person))}
                className={cn(
                  "inline-flex size-5 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50",
                  MOTION,
                  FOCUS,
                )}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="size-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --- role chips ----------------------------------------------------------------

function RoleChips({
  roles,
  value,
  onChange,
  disabled,
  texts,
}: {
  roles: readonly string[];
  value: readonly string[];
  onChange: (roles: string[]) => void;
  disabled: boolean;
  texts: FeatureFlagsAdminTexts;
}) {
  return (
    <fieldset className={FIELDSET}>
      <legend className={LEGEND}>{texts.rolesLabel}</legend>
      {roles.length === 0 ? (
        <p className="m-0 text-xs text-muted-foreground">{texts.rolesEmpty}</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {roles.map((role) => {
            const checked = value.includes(role);
            return (
              <label
                key={role}
                className={cn(
                  "group inline-flex cursor-pointer select-none items-center gap-1 rounded-full border border-solid border-input bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-accent",
                  "has-[:checked]:border-primary has-[:checked]:bg-accent has-[:checked]:text-accent-foreground",
                  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
                  MOTION,
                )}
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={checked}
                  disabled={disabled}
                  onChange={() =>
                    onChange(checked ? value.filter((item) => item !== role) : [...value, role])
                  }
                />
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="hidden size-3 group-has-[:checked]:block"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8.5l3.5 3.5L13 4.5" />
                </svg>
                {role}
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}

// --- one row -------------------------------------------------------------------

type RowProps = {
  flag: FeatureFlag;
  roles: readonly string[];
  onSave: FeatureFlagsAdminProps["onSave"];
  locked: boolean;
  renderPeoplePicker: FeatureFlagsAdminProps["renderPeoplePicker"];
  texts: FeatureFlagsAdminTexts;
  locale: string;
  now: FeatureFlagsAdminProps["now"];
  columns: number;
};

function FlagRow({
  flag,
  roles,
  onSave,
  locked,
  renderPeoplePicker,
  texts,
  locale,
  now,
  columns,
}: RowProps) {
  const [draft, setDraft] = useState<Draft>(() => draftOf(flag));
  const [status, setStatus] = useState<Status>("idle");
  const [confirming, setConfirming] = useState(false);

  // When the saved row changes (the app refetched after a save, or someone else saved), start the
  // draft from it. A status of "saved" survives, so the person sees the outcome of their save.
  const signature = signatureOf(flag);
  const [seen, setSeen] = useState(signature);
  if (seen !== signature) {
    setSeen(signature);
    setDraft(draftOf(flag));
    setConfirming(false);
    setStatus((current) => (current === "saved" ? current : "idle"));
  }

  const ids = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);

  const saving = status === "saving";
  const readOnly = flag.forcedOff === true;
  const disabled = readOnly || locked || saving;
  const dirty = isDirty(flag, draft);
  const loss: AccessLoss | null = dirty
    ? accessLoss(flag, draft, availableRoles(roles, flag))
    : null;

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  const edit = (change: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...change }));
    setConfirming(false);
    setStatus("idle");
  };

  const commit = async () => {
    setConfirming(false);
    setStatus("saving");
    try {
      await onSave(flag.key, {
        state: draft.state,
        roles: draft.roles,
        people: draft.people,
        version: flag.version,
      });
      setStatus("saved");
    } catch (error) {
      setStatus(error instanceof FeatureFlagConflictError ? "conflict" : "error");
    }
  };

  const save = () => {
    if (loss && !confirming) {
      setConfirming(true);
      return;
    }
    void commit();
  };

  const cancelConfirmation = () => {
    setConfirming(false);
    saveRef.current?.focus();
  };

  const discard = () => {
    setDraft(draftOf(flag));
    setConfirming(false);
    setStatus("idle");
  };

  const picker: PeoplePickerProps = {
    flag,
    value: draft.people,
    onChange: (people) => edit({ people }),
    disabled,
    label: texts.peopleLabel,
  };

  const overdue = flag.removeBy !== undefined && isOverdue(flag.removeBy, now);
  const removeByDate = flag.removeBy !== undefined ? formatDate(flag.removeBy, locale) : "";
  const showDetail = dirty || status !== "idle";

  return (
    <tbody className="border-t border-solid border-border">
      <tr>
        <th scope="row" className="min-w-64 max-w-sm px-3 py-3 text-left align-top font-normal">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">{flag.name}</span>
            <code className="text-xs text-muted-foreground">{flag.key}</code>
            <span className="text-xs text-muted-foreground">{flag.description}</span>
            {(readOnly || flag.removeBy !== undefined) && (
              <span className="mt-1 flex flex-wrap gap-1">
                {readOnly && (
                  <span className={cn(BADGE, "border-destructive bg-destructive/10")}>
                    {texts.forcedOff}
                  </span>
                )}
                {flag.removeBy !== undefined && (
                  <span
                    className={cn(
                      BADGE,
                      overdue ? "border-warning bg-warning/20" : "border-border bg-muted",
                    )}
                  >
                    {overdue ? texts.overdue(removeByDate) : texts.removeBy(removeByDate)}
                  </span>
                )}
              </span>
            )}
            {readOnly && (
              <span className="text-xs text-muted-foreground">{texts.forcedOffHint}</span>
            )}
            {flag.hasMcpTools && (
              <p className="m-0 mt-1 rounded-md border border-solid border-warning bg-warning/10 px-2 py-1 text-xs text-foreground">
                {texts.mcpWarning}
              </p>
            )}
          </div>
        </th>
        <td className="px-3 py-3 align-top">
          <select
            value={draft.state}
            disabled={disabled}
            aria-label={texts.stateLabel(flag.name)}
            onChange={(event) => edit({ state: event.target.value as FeatureFlagState })}
            className={cn(FIELD, "w-full min-w-36")}
          >
            <option value="off">{texts.stateOff}</option>
            <option value="on">{texts.stateOn}</option>
            <option value="selected">{texts.stateSelected}</option>
          </select>
        </td>
        <td className="px-3 py-3 align-top">
          {draft.state === "on" && (
            <span className="text-sm text-foreground">{texts.accessEveryone}</span>
          )}
          {draft.state === "off" && (
            <span className="text-sm text-muted-foreground">{texts.accessNobody}</span>
          )}
          {draft.state === "selected" && (
            <div className="flex flex-col gap-3">
              <RoleChips
                roles={availableRoles(roles, flag)}
                value={draft.roles}
                onChange={(next) => edit({ roles: next })}
                disabled={disabled}
                texts={texts}
              />
              <fieldset className={FIELDSET}>
                <legend className={LEGEND}>{texts.peopleLabel}</legend>
                {renderPeoplePicker ? (
                  renderPeoplePicker(picker)
                ) : (
                  <DefaultPeopleEditor {...picker} texts={texts} />
                )}
              </fieldset>
              {draft.roles.length === 0 && draft.people.length === 0 && (
                <p className="m-0 text-xs text-muted-foreground">{texts.selectedEmpty}</p>
              )}
            </div>
          )}
        </td>
        <td className="px-3 py-3 align-top text-xs text-muted-foreground">
          {flag.updatedAt !== undefined
            ? texts.updated(formatDate(flag.updatedAt, locale), flag.updatedBy)
            : texts.neverUpdated}
          {/* Always in the DOM so a screen reader announces the change of its text. */}
          <output className="sr-only">
            {saving ? texts.saving : status === "saved" ? texts.saved : ""}
          </output>
        </td>
      </tr>
      {showDetail && (
        <tr>
          <td colSpan={columns} className="px-3 pb-3">
            <div className="flex flex-col gap-3">
              {confirming && loss && (
                <fieldset
                  aria-labelledby={`${ids}-confirm`}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") cancelConfirmation();
                  }}
                  className="m-0 flex min-w-0 flex-col gap-2 rounded-md border border-solid border-border bg-card p-3 text-card-foreground"
                >
                  <p id={`${ids}-confirm`} className="m-0 text-sm font-medium">
                    {texts.confirmTitle(flag.name)}
                  </p>
                  <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-sm">
                    {loss.everyone && <li>{texts.confirmLoseEveryone(flag.name)}</li>}
                    {loss.roles.length > 0 && <li>{texts.confirmLoseRoles(loss.roles)}</li>}
                    {loss.people.length > 0 && <li>{texts.confirmLosePeople(loss.people)}</li>}
                    {loss.unlisted && <li>{texts.confirmLoseUnlisted}</li>}
                  </ul>
                  <div className="flex gap-2">
                    <button
                      ref={confirmRef}
                      type="button"
                      disabled={disabled}
                      onClick={() => void commit()}
                      className={BUTTON_PRIMARY}
                    >
                      {texts.confirm}
                    </button>
                    <button type="button" onClick={cancelConfirmation} className={BUTTON_SECONDARY}>
                      {texts.cancel}
                    </button>
                  </div>
                </fieldset>
              )}
              {(status === "error" || status === "conflict") && (
                <p
                  role="alert"
                  className="m-0 rounded-md border border-solid border-destructive bg-destructive/10 px-3 py-2 text-sm text-foreground"
                >
                  {status === "conflict"
                    ? texts.conflictError(flag.name)
                    : texts.saveError(flag.name)}
                </p>
              )}
              {dirty && !confirming && (
                <div className="flex items-center gap-2">
                  <button
                    ref={saveRef}
                    type="button"
                    disabled={disabled}
                    onClick={save}
                    className={BUTTON_PRIMARY}
                  >
                    {saving ? texts.saving : texts.save}
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={discard}
                    className={BUTTON_SECONDARY}
                  >
                    {texts.discard}
                  </button>
                </div>
              )}
              {status === "saved" && !dirty && (
                <p aria-hidden="true" className="m-0 text-sm text-foreground">
                  {texts.saved}
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </tbody>
  );
}

/** The roles to offer: the app's, plus any role already on the flag that the app no longer lists. */
function availableRoles(roles: readonly string[], flag: FeatureFlag): string[] {
  return [...roles, ...flag.roles.filter((role) => !roles.includes(role))];
}

// --- the table -----------------------------------------------------------------

function Notice({ children, role }: { children: ReactNode; role?: "alert" | "status" }) {
  return (
    <div
      role={role}
      className="rounded-md border border-solid border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground"
    >
      {children}
    </div>
  );
}

/**
 * Administration table for section feature flags: one row per flaggable section, with the state
 * (off, on for everyone, selected), the roles and people for `selected`, a confirmation step
 * when access is taken away, and row-level saving and error states. It fetches nothing and
 * stores nothing: the app passes the list in and saves through `onSave`.
 */
export function FeatureFlagsAdmin({
  flags,
  roles,
  onSave,
  isSaving = false,
  isLoading = false,
  loadError = false,
  onRetry,
  renderPeoplePicker,
  texts,
  locale = "en",
  now,
  className,
}: FeatureFlagsAdminProps) {
  if (loadError) {
    return (
      <div className={className}>
        <Notice role="alert">
          <p className="m-0 mb-3">{texts.loadError}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className={BUTTON_SECONDARY}>
              {texts.retry}
            </button>
          )}
        </Notice>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={className} aria-busy="true">
        <output className="sr-only">{texts.loading}</output>
        <div aria-hidden="true" className="flex flex-col gap-2">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-16 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (flags.length === 0) {
    return (
      <div className={className}>
        <Notice>{texts.empty}</Notice>
      </div>
    );
  }

  const columns = 4;

  return (
    <div className={cn("overflow-x-auto rounded-md border border-solid border-border", className)}>
      <table className="w-full border-collapse font-sans text-sm">
        <caption className="sr-only">{texts.tableLabel}</caption>
        <thead>
          <tr className="bg-muted text-xs text-muted-foreground">
            <th scope="col" className="px-3 py-2 text-left font-medium">
              {texts.columnSection}
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium">
              {texts.columnState}
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium">
              {texts.columnAccess}
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium">
              {texts.columnUpdated}
            </th>
          </tr>
        </thead>
        {flags.map((flag) => (
          <FlagRow
            key={flag.key}
            flag={flag}
            roles={roles}
            onSave={onSave}
            locked={isSaving}
            renderPeoplePicker={renderPeoplePicker}
            texts={texts}
            locale={locale}
            now={now}
            columns={columns}
          />
        ))}
      </table>
    </div>
  );
}
