import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CONSENT_OPEN_EVENT,
  CONSENT_STORAGE_KEY,
  consentHeadScript,
  gtmNoScriptSrc,
  openCookieSettings,
  readConsent,
  writeConsent,
} from "../src/cookie-consent/consent";

const fakeWindow = (stored: string | null, storageThrows = false) => {
  const data = new Map<string, string>();
  if (stored !== null) data.set(CONSENT_STORAGE_KEY, stored);
  const fail = () => {
    throw new Error("blocked");
  };
  return {
    data,
    dataLayer: undefined as unknown[] | undefined,
    gtag: undefined as ((...args: unknown[]) => void) | undefined,
    dispatchEvent: vi.fn(),
    localStorage: {
      getItem: storageThrows ? fail : (key: string) => data.get(key) ?? null,
      setItem: storageThrows ? fail : (key: string, value: string) => data.set(key, value),
    },
  };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("consentHeadScript", () => {
  it("denies storage by default and loads the container", () => {
    const script = consentHeadScript("GTM-ABC123");
    expect(script).toContain("gtag('consent','default',{ad_storage:'denied'");
    expect(script).toContain(`localStorage.getItem('${CONSENT_STORAGE_KEY}')==='granted'`);
    expect(script).toContain("https://www.googletagmanager.com/gtm.js?id=GTM-ABC123");
  });

  it("refuses anything that is not a container id, so nothing can be injected", () => {
    expect(() => consentHeadScript("GTM-ABC');alert(1)//")).toThrow(/container id/);
    expect(() => gtmNoScriptSrc("UA-123")).toThrow(/container id/);
  });
});

describe("gtmNoScriptSrc", () => {
  it("points at the noscript frame of the container", () => {
    expect(gtmNoScriptSrc("GTM-ABC123")).toBe(
      "https://www.googletagmanager.com/ns.html?id=GTM-ABC123",
    );
  });
});

describe("readConsent", () => {
  it("returns a stored choice", () => {
    vi.stubGlobal("window", fakeWindow("granted"));
    expect(readConsent()).toBe("granted");
  });

  it("returns null for no choice, an unknown value or blocked storage", () => {
    vi.stubGlobal("window", fakeWindow(null));
    expect(readConsent()).toBeNull();
    vi.stubGlobal("window", fakeWindow("maybe"));
    expect(readConsent()).toBeNull();
    vi.stubGlobal("window", fakeWindow("granted", true));
    expect(readConsent()).toBeNull();
  });
});

describe("writeConsent", () => {
  it("stores the choice and pushes a consent update", () => {
    const w = fakeWindow(null);
    vi.stubGlobal("window", w);
    writeConsent("granted");
    expect(w.data.get(CONSENT_STORAGE_KEY)).toBe("granted");
    expect(w.dataLayer).toHaveLength(1);
    const pushed = Array.from(w.dataLayer?.[0] as ArrayLike<unknown>);
    expect(pushed[0]).toBe("consent");
    expect(pushed[1]).toBe("update");
    expect(pushed[2]).toMatchObject({ analytics_storage: "granted", ad_storage: "granted" });
  });

  it("uses an existing gtag, and still applies the choice when storage is blocked", () => {
    const w = fakeWindow(null, true);
    const gtag = vi.fn();
    w.gtag = gtag;
    vi.stubGlobal("window", w);
    writeConsent("denied");
    expect(gtag).toHaveBeenCalledWith("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
  });
});

describe("openCookieSettings", () => {
  it("dispatches the event the banner listens to", () => {
    const w = fakeWindow(null);
    vi.stubGlobal("window", w);
    vi.stubGlobal(
      "Event",
      class {
        constructor(public type: string) {}
      },
    );
    openCookieSettings();
    expect(w.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: CONSENT_OPEN_EVENT }),
    );
  });
});
