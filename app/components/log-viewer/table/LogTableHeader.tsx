import { memo } from "react";
import {
  flexRender,
  type SortingState,
  type Table,
} from "@tanstack/react-table";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { NormalizedLogRecord } from "@/types/otlp";
import { CHEVRON_WIDTH } from "./logTableLayout";

interface Props {
  table: Table<NormalizedLogRecord>;
  sorting: SortingState; // unused below - only here for the memo comparison
}

function LogTableHeaderImpl({ table }: Props) {
  return (
    <>
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
    </>
  );
}

// Memoized on `sorting` since `table`'s reference never changes.
export const LogTableHeader = memo(LogTableHeaderImpl);
