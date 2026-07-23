import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ESTIMATED_ROW_HEIGHT } from "../logTableLayout";

export function useRowVirtualizer(
  rowCount: number,
  getRowId: (index: number) => string,
) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 8,
    getItemKey: getRowId,
  });

  return { scrollRef, virtualizer };
}
