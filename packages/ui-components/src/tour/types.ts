import type { ReactNode } from "react";

export type TourStep = {
  /** Name of the `data-tour` attribute this step highlights. Without one, the step sits mid-screen. */
  anchor?: string;
  /** Rendered in a round badge beside the title (an icon, an emoji). */
  icon?: ReactNode;
  title: string;
  description: string;
};

export type TourTexts = {
  next: string;
  back: string;
  done: string;
  skip: string;
  /** Accessible name of the close cross. */
  close: string;
  /** Progress label; `{{current}}` and `{{total}}` are replaced, e.g. "{{current}} of {{total}}". */
  progress: string;
};

/** Why a tour ended: the last step's button, or skipped (button, close cross, Escape) or torn down. */
export type TourEndReason = "finished" | "dismissed";

export type TourStorage = Partial<Pick<Storage, "getItem" | "setItem" | "removeItem">>;

export type TourOptions = {
  /** Identifies the tour in storage. Version it (`welcome-v2`) so a later tour shows again. */
  id: string;
  steps: readonly TourStep[];
  texts: TourTexts;
  /** Where "seen" is remembered. Defaults to `localStorage`. */
  storage?: TourStorage;
  /** Where focus returns once the tour ends. Defaults to `#main-content`. */
  returnFocusTo?: () => HTMLElement | null;
  /** Called once when the tour ends, after it was recorded as seen. */
  onEnd?: (reason: TourEndReason) => void;
};

export type TourProps = TourOptions & {
  /** Gate for the automatic start, e.g. "only on the home route". Default true. */
  enabled?: boolean;
  /** Anchor to wait for before an automatic start (rows rendered after a fetch); starts anyway after `waitTimeoutMs`. */
  waitFor?: string;
  /** Default 4000. */
  waitTimeoutMs?: number;
};
