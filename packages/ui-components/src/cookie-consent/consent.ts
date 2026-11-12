/**
 * Google Consent Mode v2 for the public Platform sites.
 *
 * Analytics and advertising storage start denied. Google Tag Manager still loads, so tags that work
 * without cookies keep working, but no tag that needs storage fires until the visitor accepts in the
 * banner. The choice is kept in localStorage and re-applied before GTM runs on every later visit.
 */

export const CONSENT_STORAGE_KEY = "pc-cookie-consent";
/** Window event the banner listens to, to show itself again from a "Cookie settings" link. */
export const CONSENT_OPEN_EVENT = "pc-cookie-consent:open";

export type ConsentChoice = "granted" | "denied";

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/;

type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

function assertGtmId(gtmId: string): void {
  if (!GTM_ID_PATTERN.test(gtmId))
    throw new Error(`Not a Google Tag Manager container id: ${gtmId}`);
}

/**
 * The inline script for the page `<head>`, before anything else that talks to Google. It sets the
 * denied defaults, applies a stored choice, and loads the container with the standard GTM snippet.
 * Render it as the first script in `<head>`; nothing else is needed to load GTM.
 */
export function consentHeadScript(gtmId: string): string {
  assertGtmId(gtmId);
  return [
    "window.dataLayer=window.dataLayer||[];",
    "function gtag(){dataLayer.push(arguments);}",
    "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});",
    `try{if(localStorage.getItem('${CONSENT_STORAGE_KEY}')==='granted'){gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});}}catch(e){}`,
    "gtag('js',new Date());",
    "dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});",
    `(function(d){var s=d.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id=${gtmId}';d.head.appendChild(s);})(document);`,
  ].join("");
}

/** The `src` of the standard GTM `<noscript>` iframe, for visitors without JavaScript. */
export function gtmNoScriptSrc(gtmId: string): string {
  assertGtmId(gtmId);
  return `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
}

/** The visitor's stored choice, or `null` when they have not chosen yet (or storage is unavailable). */
export function readConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

/** Stores the choice and tells Google tags about it straight away, without a reload. */
export function writeConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Private mode or blocked storage: the choice still applies to this page view below.
  }
  const w = window as GtagWindow;
  w.dataLayer = w.dataLayer ?? [];
  const gtag =
    w.gtag ??
    function gtag() {
      // biome-ignore lint/style/noArguments: gtag commands are pushed as the arguments object, as Google's snippet does.
      w.dataLayer?.push(arguments);
    };
  gtag("consent", "update", {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  });
}

/** Shows the banner again so the visitor can change their choice. Wire it to a "Cookie settings" link. */
export function openCookieSettings(): void {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
