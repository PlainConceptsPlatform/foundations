"use client";

import type { Config, DriveStep, Driver } from "driver.js";
import { type ReactNode, useEffect, useState } from "react";
import { forgetTour, hasSeenTour, markTourSeen } from "./tour-storage";
import { injectTourStyles } from "./tour-styles";
import type { TourEndReason, TourOptions, TourProps, TourStep, TourTexts } from "./types";

export type {
  TourEndReason,
  TourOptions,
  TourProps,
  TourStep,
  TourStorage,
  TourTexts,
} from "./types";
export { forgetTour, hasSeenTour, markTourSeen, tourStorageKey } from "./tour-storage";

const DEFAULT_WAIT_MS = 4000;
const POLL_MS = 200;
const REQUEST_EVENT = "platform:tour-request";

// Once per page load, even when storage cannot remember it (private window, blocked storage).
const startedThisLoad = new Set<string>();

/** Props that mark an element as a tour anchor: `<nav {...tourAnchor("main-nav")}>`. */
export const tourAnchor = (anchor: string) => ({ "data-tour": anchor });

export const anchorSelector = (anchor: string) => `[data-tour="${anchor}"]`;

/** The steps that can show now: one whose element is not on the page is skipped. */
export function availableSteps(
  steps: readonly TourStep[],
  root: ParentNode = document,
): TourStep[] {
  return steps.filter(
    (step) => !step.anchor || root.querySelector(anchorSelector(step.anchor)) !== null,
  );
}

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char,
  );

type Markup = (node: ReactNode) => string;

// driver.js fills its popover as HTML, so every string is escaped here and only the icon is markup.
function stepTitle(step: TourStep, markup: Markup): string {
  const icon = step.icon
    ? `<span class="pc-tour-icon" aria-hidden="true">${markup(step.icon)}</span>`
    : "";
  return `<span class="pc-tour-heading">${icon}<span>${escapeHtml(step.title)}</span></span>`;
}

// The first step has nothing to go back to, so it offers Next and close only.
const FIRST_STEP_BUTTONS: NonNullable<Config["showButtons"]> = ["next", "close"];

/** Maps steps to driver.js steps. */
export function toDriveSteps(steps: readonly TourStep[], markup: Markup = () => ""): DriveStep[] {
  return steps.map((step, index) => ({
    element: step.anchor ? anchorSelector(step.anchor) : undefined,
    popover: {
      title: stepTitle(step, markup),
      description: escapeHtml(step.description),
      // A step with nothing to point at sits mid-screen, so it can take more room.
      popoverClass: step.anchor ? "pc-tour" : "pc-tour pc-tour-wide",
      ...(index === 0 && { showButtons: FIRST_STEP_BUTTONS }),
    },
  }));
}

/** Adds a visible "Skip" button and puts focus on the step's main action. */
function decoratePopover(
  skipText: string,
  driverApi: () => Driver | undefined,
): Config["onPopoverRender"] {
  return (popover) => {
    const skip = document.createElement("button");
    skip.type = "button";
    skip.className = "pc-tour-skip";
    skip.textContent = skipText;
    skip.addEventListener("click", () => driverApi()?.destroy());
    popover.footer.prepend(skip);
    // driver.js focuses the popover's first control (Skip); the step's own action is Next.
    setTimeout(() => popover.nextButton.focus(), 0);
  };
}

function driverTexts(texts: TourTexts): Partial<Config> {
  return {
    progressText: texts.progress,
    nextBtnText: texts.next,
    prevBtnText: texts.back,
    doneBtnText: texts.done,
    closeBtnLabel: texts.close,
  };
}

/**
 * Starts a tour with the steps whose element is on the page. Finishing, skipping (button, close
 * or Escape) or leaving the page records it as seen, so it shows once per browser. Resolves
 * undefined when there is nothing to show.
 *
 * Each spotlight scrolls its element into view, so ending puts the page back where it started.
 * driver.js and the markup renderer load on demand, so a visit that never shows the tour does not
 * pay for them.
 */
export async function startTour({
  id,
  steps,
  texts,
  storage,
  onEnd,
  returnFocusTo = () => document.getElementById("main-content"),
}: TourOptions): Promise<Driver | undefined> {
  const available = availableSteps(steps);
  if (available.length === 0) return undefined;
  const [{ driver }, { renderToStaticMarkup }] = await Promise.all([
    import("driver.js"),
    import("react-dom/server"),
  ]);
  injectTourStyles();
  const markup: Markup = (node) => renderToStaticMarkup(node);
  const startedAt = { x: window.scrollX, y: window.scrollY };
  let reason: TourEndReason = "dismissed";
  const instance: Driver = driver({
    ...driverTexts(texts),
    steps: toDriveSteps(available, markup),
    showProgress: true,
    allowClose: true,
    allowKeyboardControl: true,
    overlayClickBehavior: () => undefined,
    disableActiveInteraction: true,
    skipMissingElement: true,
    popoverClass: "pc-tour",
    stagePadding: 6,
    stageRadius: 8,
    onPopoverRender: decoratePopover(texts.skip, () => instance),
    // Done runs this instead of the default, which would destroy the tour without a reason.
    onNextClick: () => {
      if (instance.isLastStep()) {
        reason = "finished";
        instance.destroy();
      } else {
        instance.moveNext();
      }
    },
    onDestroyed: () => {
      markTourSeen(id, storage);
      // preventScroll: focusing the main content must not move the page away from where it was.
      returnFocusTo()?.focus({ preventScroll: true });
      window.scrollTo(startedAt.x, startedAt.y);
      onEnd?.(reason);
    },
  });
  instance.drive();
  return instance;
}

/**
 * Takes a tour again on request (a "Take the tour" menu item): forgets that it was seen and asks
 * the mounted `Tour` with that id to start. Navigate to the tour's page first.
 */
export function requestTour(id: string, storage?: TourOptions["storage"]) {
  forgetTour(id, storage);
  startedThisLoad.delete(id);
  window.dispatchEvent(new CustomEvent(REQUEST_EVENT, { detail: id }));
}

/** Resolves once `selector` matches, or after `timeoutMs` either way. */
export function waitForElement(
  selector: string,
  timeoutMs: number,
): { promise: Promise<void>; cancel: () => void } {
  let timer: ReturnType<typeof setInterval> | undefined;
  let done = () => {};
  const promise = new Promise<void>((resolve) => {
    done = resolve;
    const deadline = Date.now() + timeoutMs;
    const check = () => {
      if (document.querySelector(selector) || Date.now() >= deadline) {
        clearInterval(timer);
        resolve();
      }
    };
    timer = setInterval(check, POLL_MS);
    check();
  });
  return {
    promise,
    cancel: () => {
      clearInterval(timer);
      done();
    },
  };
}

/**
 * A guided tour of the page, shown once per browser: mount it where the anchors are (it renders
 * nothing) and mark the elements to point at with `data-tour`.
 *
 * ```tsx
 * <Tour id="welcome-v1" steps={steps} texts={texts} waitFor="row-menu" enabled={pathname === "/"} />
 * ```
 */
export function Tour(props: TourProps) {
  const { id, enabled = true, waitFor, waitTimeoutMs = DEFAULT_WAIT_MS } = props;
  // Bumped by requestTour, so a request on the tour's own page starts it again.
  const [requests, setRequests] = useState(0);
  // The latest props without restarting the effect when a parent re-renders with new literals.
  const [latest] = useState(() => ({ current: props }));
  latest.current = props;

  useEffect(() => {
    const onRequest = (event: Event) => {
      if ((event as CustomEvent<string>).detail === id) setRequests((count) => count + 1);
    };
    window.addEventListener(REQUEST_EVENT, onRequest);
    return () => window.removeEventListener(REQUEST_EVENT, onRequest);
  }, [id]);

  // A request starts the tour even where `enabled` is off (a menu item on another page state);
  // its change is also what starts it again on its own page.
  useEffect(() => {
    if (
      !(enabled || requests > 0) ||
      startedThisLoad.has(id) ||
      hasSeenTour(id, latest.current.storage)
    )
      return;
    let cancelled = false;
    let tour: Driver | undefined;
    const wait = waitFor ? waitForElement(anchorSelector(waitFor), waitTimeoutMs) : undefined;
    Promise.resolve(wait?.promise)
      .then(async () => {
        if (cancelled) return;
        startedThisLoad.add(id);
        const { steps, texts, storage, returnFocusTo, onEnd } = latest.current;
        tour = await startTour({ id, steps, texts, storage, returnFocusTo, onEnd });
        if (cancelled) tour?.destroy();
      })
      .catch((error: unknown) => console.error("The tour could not start:", error));
    return () => {
      cancelled = true;
      wait?.cancel();
      tour?.destroy();
    };
  }, [id, enabled, waitFor, waitTimeoutMs, requests, latest]);

  return null;
}
