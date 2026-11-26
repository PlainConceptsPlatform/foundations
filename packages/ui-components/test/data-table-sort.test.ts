import { describe, expect, it } from "vitest";
import { isColumnSortable, nextSort } from "../src/data-table/sort-state";

describe("data table sort", () => {
  it("cycles a column through asc, desc and off, and starts another column ascending", () => {
    const asc = nextSort(null, "name");
    expect(asc).toEqual({ by: "name", order: "asc" });
    const desc = nextSort(asc, "name");
    expect(desc).toEqual({ by: "name", order: "desc" });
    expect(nextSort(desc, "name")).toBeNull();
    expect(nextSort(desc, "owner")).toEqual({ by: "owner", order: "asc" });
  });

  it("sorts on the client only by a sortValue the column does not opt out of", () => {
    const value = () => "x";
    expect(isColumnSortable({ sortValue: value }, false)).toBe(true);
    expect(isColumnSortable({ sortable: true }, false)).toBe(false);
    expect(isColumnSortable({ sortValue: value, sortable: false }, false)).toBe(false);
  });

  it("sorts on the server only the columns marked sortable", () => {
    expect(isColumnSortable({ sortable: true }, true)).toBe(true);
    expect(isColumnSortable({ sortValue: () => "x" }, true)).toBe(false);
  });
});
