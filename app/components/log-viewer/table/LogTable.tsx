"use client";

import { memo, useRef, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { NormalizedLogRecord } from "@/types/otlp";
import { LogRow } from "./LogRow";
import { logTableColumns } from "./logTableColumns";
import {
  CHEVRON_WIDTH,
  ROW_MIN_WIDTH,
  ESTIMATED_ROW_HEIGHT,
} from "./logTableLayout";

interface Props {
  records: NormalizedLogRecord[];
  maxHeight?: number;
  virtualized?: boolean;
}

function LogTableImpl({ records, maxHeight, virtualized = true }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "time", desc: true },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data: records,
    columns: logTableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 8,
    getItemKey: (index) => rows[index].id,
  });

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
        {/* Header */}
        {table.getHeaderGroups().map((headerGroup) => (
          <div
            key={headerGroup.id}
            role="row"
            className="sticky top-0 z-10 flex border-b border-line bg-gray-50/80 dark:border-line-dark dark:bg-gray-800/95 backdrop-blur-sm"
          >
            <div
              style={{ width: CHEVRON_WIDTH }}
              className="flex-shrink-0 pl-3"
            />
            {headerGroup.headers.map((header) => {
              const sortState = header.column.getIsSorted();
              return (
                <div
                  key={header.id}
                  role="columnheader"
                  style={{
                    width: header.column.getSize(),
                    minWidth:
                      header.column.id === "body"
                        ? header.column.getSize()
                        : undefined,
                  }}
                  className={`${header.column.id === "body" ? "flex-1" : "flex-shrink-0"} py-2 pr-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap ${
                    header.column.getCanSort()
                      ? "cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200"
                      : ""
                  }`}
                  onClick={(e) => header.column.getToggleSortingHandler()?.(e)}
                >
                  <span className="inline-flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {sortState && (
                      <ChevronDownIcon
                        className={`w-3 h-3 transition-transform ${sortState === "asc" ? "rotate-180" : ""}`}
                      />
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        ))}

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
                    onToggle={() =>
                      setExpandedId((cur) => (cur === row.id ? null : row.id))
                    }
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
              onToggle={() =>
                setExpandedId((cur) => (cur === row.id ? null : row.id))
              }
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
