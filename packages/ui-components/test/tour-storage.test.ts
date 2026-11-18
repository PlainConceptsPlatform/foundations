import { describe, expect, it } from "vitest";
import { forgetTour, hasSeenTour, markTourSeen, tourStorageKey } from "../src/tour/tour-storage";
import type { TourStorage } from "../src/tour/types";

const memory = (): TourStorage & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
};

const failing: TourStorage = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("full");
  },
  removeItem: () => {
    throw new Error("blocked");
  },
};

describe("tour storage", () => {
  it("namespaces the key by tour id", () => {
    expect(tourStorageKey("welcome")).toBe("platform:tour:welcome");
  });

  it("records, reads and forgets a tour", () => {
    const storage = memory();
    expect(hasSeenTour("welcome", storage)).toBe(false);
    markTourSeen("welcome", storage, new Date("2026-01-02T03:04:05Z"));
    expect(storage.data.get("platform:tour:welcome")).toBe("2026-01-02T03:04:05.000Z");
    expect(hasSeenTour("welcome", storage)).toBe(true);
    expect(hasSeenTour("other", storage)).toBe(false);
    forgetTour("welcome", storage);
    expect(hasSeenTour("welcome", storage)).toBe(false);
  });

  it("treats missing or failing storage as never seen, and never throws", () => {
    expect(hasSeenTour("welcome", undefined)).toBe(false);
    expect(hasSeenTour("welcome", failing)).toBe(false);
    expect(() => markTourSeen("welcome", failing)).not.toThrow();
    expect(() => forgetTour("welcome", failing)).not.toThrow();
  });
});
