import { useState } from "react";
import type { SortingState } from "@tanstack/react-table";

const DEFAULT_SORTING: SortingState = [{ id: "time", desc: true }];

export function useLogSorting() {
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING);
  return { sorting, setSorting };
}
