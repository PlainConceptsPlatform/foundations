"use client";

import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { CONSENT_OPEN_EVENT, type ConsentChoice, readConsent, writeConsent } from "./consent";

export type CookieConsentTexts = {
  title: string;
  body: string;
  accept: string;
  reject: string;
  policy: string;
};

const DEFAULT_TEXTS: CookieConsentTexts = {
  title: "Cookies",
  body: "We use analytics cookies to understand how this site is used. They are only set if you accept.",
  accept: "Accept",
  reject: "Reject",
  policy: "Cookie policy",
};

type CookieConsentProps = {
  /** Link to the cookie or privacy policy. Without it the banner shows no link. */
  policyHref?: string;
  texts?: Partial<CookieConsentTexts>;
  className?: string;
  /** Called after the visitor chooses, once the choice is stored and sent to Google tags. */
  onChoice?: (choice: ConsentChoice) => void;
};

/**
 * The consent banner. It shows while the visitor has not chosen, and again whenever
 * `openCookieSettings()` is called. Accept and Reject carry equal weight, as the GDPR guidance
 * expects. Pair it with `consentHeadScript` in the page head, which sets the denied defaults.
 */
export function CookieConsent({ policyHref, texts, className, onChoice }: CookieConsentProps) {
  const t = { ...DEFAULT_TEXTS, ...texts };
  // Rendered only after mount: the stored choice lives in the browser, so server HTML never shows it.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(readConsent() === null);
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (choice: ConsentChoice) => {
    writeConsent(choice);
    setOpen(false);
    onChoice?.(choice);
  };

  const button =
    "inline-flex h-9 cursor-pointer items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <section
      aria-label={t.title}
      className={cn(
        "fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-2xl flex-col gap-3 rounded-lg border border-border bg-background p-4 text-foreground shadow-lg sm:flex-row sm:items-center",
        className,
      )}
    >
      <div className="flex-1 text-sm">
        <p className="m-0 font-semibold">{t.title}</p>
        <p className="m-0 mt-1 text-muted-foreground">
          {t.body}
          {policyHref ? (
            <>
              {" "}
              <a href={policyHref} className="underline hover:text-foreground">
                {t.policy}
              </a>
            </>
          ) : null}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => choose("denied")}
          className={cn(
            button,
            "border border-border bg-background text-foreground hover:bg-muted",
          )}
        >
          {t.reject}
        </button>
        <button
          type="button"
          onClick={() => choose("granted")}
          className={cn(
            button,
            "border border-primary bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {t.accept}
        </button>
      </div>
    </section>
  );
}
