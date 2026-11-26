export type SortOrder = "asc" | "desc";
export type SortState = { by: string; order: SortOrder };

export type SortableColumn = { sortable?: boolean; sortValue?: unknown };

export function isColumnSortable(column: SortableColumn, manualSorting: boolean): boolean {
  if (manualSorting) return column.sortable === true;
  return column.sortable !== false && column.sortValue != null;
}

export function nextSort(current: SortState | null, key: string): SortState | null {
  if (current?.by !== key) return { by: key, order: "asc" };
  if (current.order === "asc") return { by: key, order: "desc" };
  return null;
}
