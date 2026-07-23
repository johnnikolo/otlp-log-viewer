"use client";

import { memo } from "react";
import { NormalizedLogRecord } from "@/types/otlp";
import { LogRow } from "./LogRow";
import { LogTableHeader } from "./LogTableHeader";
import { useRowExpansion } from "./hooks/useRowExpansion";
import { useLogSorting } from "./hooks/useLogSorting";
import { useLogTable } from "./hooks/useLogTable";
import { useRowVirtualizer } from "./hooks/useRowVirtualizer";
import { ROW_MIN_WIDTH } from "./logTableLayout";

interface Props {
  records: NormalizedLogRecord[];
  maxHeight?: number;
  virtualized?: boolean;
}

function LogTableImpl({ records, maxHeight, virtualized = true }: Props) {
  const { expandedId, toggle } = useRowExpansion();
  const { sorting, setSorting } = useLogSorting();
  const table = useLogTable(records, sorting, setSorting);
  const rows = table.getRowModel().rows;
  const { scrollRef, virtualizer } = useRowVirtualizer(
    rows.length,
    (index) => rows[index].id,
  );

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted dark:text-muted-dark text-sm">
        No log records found.
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      role="table"
      className={`overflow-auto text-sm ${maxHeight ? "" : "h-full"}`}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <div style={{ minWidth: ROW_MIN_WIDTH }}>
        <LogTableHeader table={table} sorting={sorting} />

        {virtualized ? (
          <div
            style={{
              height: virtualizer.getTotalSize(),
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <div
                  key={row.id}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <LogRow
                    row={row}
                    expanded={expandedId === row.id}
                    onToggle={() => toggle(row.id)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          rows.map((row) => (
            <LogRow
              key={row.id}
              row={row}
              expanded={expandedId === row.id}
              onToggle={() => toggle(row.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Memoized: with a stable `records` reference (see LogViewer), unrelated parent
// re-renders skip rebuilding the table row model + virtualizer. Internal state
// (sorting, expanded row) still re-renders normally.
export const LogTable = memo(LogTableImpl);
