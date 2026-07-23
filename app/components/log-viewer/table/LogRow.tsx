"use client";

import { flexRender, type Row } from "@tanstack/react-table";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { NormalizedLogRecord } from "@/types/otlp";
import { SEVERITY_COLORS } from "@/lib/utils/severity";
import { LogDetail } from "../detail/LogDetail";
import { CHEVRON_WIDTH } from "./logTableLayout";

interface Props {
  row: Row<NormalizedLogRecord>;
  expanded: boolean;
  onToggle: () => void;
}

export function LogRow({ row, expanded, onToggle }: Props) {
  const record = row.original;
  const rowColor = SEVERITY_COLORS[record.severityText].row;

  return (
    <div className="border-b border-divider dark:border-divider-dark">
      <div
        role="row"
        tabIndex={0}
        aria-expanded={expanded}
        className={`flex items-center cursor-pointer hover:bg-blue-50/40 dark:hover:bg-indigo-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 transition-colors ${rowColor} ${expanded ? "bg-blue-50/40 dark:bg-indigo-500/10" : ""}`}
        onClick={onToggle}
        onKeyDown={(e) => {
          // Enter/Space toggle the row, matching native button/disclosure behavior.
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        {/* Expand chevron */}
        <div
          role="cell"
          style={{ width: CHEVRON_WIDTH }}
          className="flex-shrink-0 pl-3 pr-1 py-2 text-gray-300 dark:text-gray-600"
        >
          <ChevronRightIcon
            className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </div>

        {row.getVisibleCells().map((cell) => (
          <div
            key={cell.id}
            role="cell"
            style={{
              width: cell.column.getSize(),
              minWidth:
                cell.column.id === "body" ? cell.column.getSize() : undefined,
            }}
            className={`${cell.column.id === "body" ? "flex-1 min-w-0" : "flex-shrink-0"} ${cell.column.columnDef.meta?.cellClassName ?? ""}`}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        ))}
      </div>

      {/* Expanded detail */}
      {expanded && <LogDetail record={record} />}
    </div>
  );
}
