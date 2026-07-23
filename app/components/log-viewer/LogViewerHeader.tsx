"use client";

import { useState } from "react";
import { FileTextIcon } from "@radix-ui/react-icons";
import { formatCompactNumber } from "@/lib/utils";
import { useLogsQuery } from "@/lib/useLogsQuery";
import { ThemeToggle } from "../ui/ThemeToggle";
import { RefreshControl } from "./controls/RefreshControl";
import { TimeRangePicker } from "./controls/TimeRangePicker";
import { ViewModeToggle, ViewMode } from "./controls/ViewModeToggle";

interface Props {
  totalCount: number;
  errorCount: number;
  warnCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  rangeMs: number | null;
  onRangeChange: (ms: number | null) => void;
}

export function LogViewerHeader({
  totalCount,
  errorCount,
  warnCount,
  viewMode,
  onViewModeChange,
  rangeMs,
  onRangeChange,
}: Props) {
  const [autoRefreshMs, setAutoRefreshMs] = useState<number | null>(null);
  // Shares LogViewer's cache entry - no extra fetch.
  const { isLoading, isFetching, dataUpdatedAt, refetch } = useLogsQuery(
    autoRefreshMs ?? false,
  );

  return (
    <header className="flex-shrink-0 border-b border-line bg-surface dark:border-line-dark dark:bg-surface-dark px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-2">
        {/* Logo mark */}
        <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center">
          <FileTextIcon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Log Explorer
        </span>
      </div>

      <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block" />

      {/* Stats */}
      {!isLoading && (
        <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
          <span className="text-gray-500 dark:text-gray-400">
            Showing{" "}
            <span className="text-gray-900 dark:text-white font-semibold">
              {formatCompactNumber(totalCount)}
            </span>{" "}
            logs
          </span>
          {errorCount > 0 && (
            <span className="text-red-600 dark:text-red-400">
              <span className="font-semibold">
                {formatCompactNumber(errorCount)}
              </span>{" "}
              error &amp; fatal
            </span>
          )}
          {warnCount > 0 && (
            <span className="text-amber-600 dark:text-amber-400">
              <span className="font-semibold">
                {formatCompactNumber(warnCount)}
              </span>{" "}
              warn
            </span>
          )}
        </div>
      )}

      <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-3 flex-wrap">
        {dataUpdatedAt > 0 && (
          <span className="text-xs text-muted dark:text-muted-dark font-mono hidden sm:inline">
            Updated at {new Date(dataUpdatedAt).toLocaleTimeString()}
          </span>
        )}

        <ViewModeToggle value={viewMode} onChange={onViewModeChange} />

        <ThemeToggle />

        <TimeRangePicker value={rangeMs} onChange={onRangeChange} />

        <RefreshControl
          onRefresh={() => refetch()}
          isFetching={isFetching}
          autoRefreshMs={autoRefreshMs}
          onAutoRefreshChange={setAutoRefreshMs}
        />
      </div>
    </header>
  );
}
