"use client";

import { openCookieSettings } from "@plainconceptsplatform/ui-components/cookie-consent";

/** This site runs the real banner, so the demo reopens it rather than drawing a copy. */
export function CookieConsentDemo() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-3 text-sm text-muted-foreground">
        This site loads the banner from its root layout. Open it to see it, and to change your own
        choice.
      </p>
      <button
        type="button"
        onClick={openCookieSettings}
        className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
      >
        Cookie settings
      </button>
    </div>
  );
}
