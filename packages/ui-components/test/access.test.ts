import { describe, expect, it } from "vitest";
import { accessLoss, formatDate, isDirty, isOverdue } from "../src/feature-flags/access";

const choice = (state: "off" | "on" | "selected", roles: string[] = [], people: string[] = []) => ({
  state,
  roles,
  people,
});

describe("accessLoss", () => {
  const roles = ["admin", "editor", "viewer"];

  it("is null when nothing is taken away", () => {
    expect(accessLoss(choice("off"), choice("on"), roles)).toBeNull();
    expect(accessLoss(choice("off"), choice("selected", ["admin"]), roles)).toBeNull();
    expect(accessLoss(choice("selected", ["admin"]), choice("on"), roles)).toBeNull();
  });

  it("takes the section from everyone when on becomes off", () => {
    expect(accessLoss(choice("on"), choice("off"), roles)).toEqual({
      everyone: true,
      unlisted: false,
      roles: [],
      people: [],
    });
  });

  it("names the roles and unlisted people that lose it when on narrows to selected", () => {
    expect(accessLoss(choice("on"), choice("selected", ["admin"], ["ana"]), roles)).toEqual({
      everyone: false,
      unlisted: true,
      roles: ["editor", "viewer"],
      people: [],
    });
  });

  it("lists every selected role and person when selected becomes off", () => {
    expect(accessLoss(choice("selected", ["admin"], ["ana", "ben"]), choice("off"), roles)).toEqual(
      { everyone: false, unlisted: false, roles: ["admin"], people: ["ana", "ben"] },
    );
  });

  it("lists only what a narrower selection removes", () => {
    expect(
      accessLoss(
        choice("selected", ["admin", "editor"], ["ana", "ben"]),
        choice("selected", ["admin"], ["ben", "cy"]),
        roles,
      ),
    ).toEqual({ everyone: false, unlisted: false, roles: ["editor"], people: ["ana"] });
  });

  it("is null when a selection only grows", () => {
    expect(
      accessLoss(choice("selected", ["admin"]), choice("selected", ["admin", "editor"]), roles),
    ).toBeNull();
  });
});

describe("isDirty", () => {
  it("is dirty when the state changes", () => {
    expect(isDirty(choice("off"), choice("on"))).toBe(true);
  });

  it("ignores roles and people outside selected", () => {
    expect(isDirty(choice("on", ["admin"]), choice("on", ["editor"]))).toBe(false);
  });

  it("compares selections as sets", () => {
    expect(isDirty(choice("selected", ["a", "b"]), choice("selected", ["b", "a"]))).toBe(false);
    expect(isDirty(choice("selected", ["a"]), choice("selected", ["a", "b"]))).toBe(true);
    expect(isDirty(choice("selected", [], ["x"]), choice("selected", [], ["y"]))).toBe(true);
  });
});

describe("isOverdue", () => {
  it("is overdue only after the removeBy day", () => {
    expect(isOverdue("2026-03-01", "2026-03-01T23:59:00Z")).toBe(false);
    expect(isOverdue("2026-03-01", "2026-03-02T00:00:00Z")).toBe(true);
    expect(isOverdue("2026-03-01T10:00:00Z", new Date("2026-02-28T00:00:00Z"))).toBe(false);
  });

  it("compares with today when the reference is not a date", () => {
    expect(isOverdue("2000-01-01", "not a date")).toBe(true);
    expect(isOverdue("9999-12-31", undefined)).toBe(false);
  });
});

describe("formatDate", () => {
  it("formats in UTC so the day does not shift with the time zone", () => {
    expect(formatDate("2026-03-01T23:30:00Z", "en-GB")).toBe("1 Mar 2026");
  });

  it("returns a value it cannot parse unchanged", () => {
    expect(formatDate("soon", "en-GB")).toBe("soon");
  });
});
