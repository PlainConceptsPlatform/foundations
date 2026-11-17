import { describe, expect, it } from "vitest";
import { getInitials } from "../src/app-sidebar/get-initials";

describe("getInitials", () => {
  it("takes the first letter of the first two words", () => {
    expect(getInitials("Ada Lovelace King")).toBe("AL");
  });

  it("takes the first two letters of a single word", () => {
    expect(getInitials("  Platform  ")).toBe("Pl");
  });

  it("collapses repeated whitespace between words", () => {
    expect(getInitials("Grace \t  Hopper")).toBe("GH");
  });

  it("returns an empty string for blank input", () => {
    expect(getInitials("   ")).toBe("");
  });
});
