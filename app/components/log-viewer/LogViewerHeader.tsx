"use client";

import { FileTextIcon } from "@radix-ui/react-icons";
import { formatCompactNumber } from "@/lib/utils";
import { ThemeToggle } from "../ui/ThemeToggle";
import { RefreshControl } from "./controls/RefreshControl";
import { TimeRangePicker } from "./controls/TimeRangePicker";
import { ViewModeToggle, ViewMode } from "./controls/ViewModeToggle";

interface Props {
  isLoading: boolean;
  totalCount: number;
  errorCount: number;
  warnCount: number;
  dataUpdatedAt: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  rangeMs: number | null;
  onRangeChange: (ms: number | null) => void;
  onRefresh: () => void;
  isFetching: boolean;
  autoRefreshMs: number | null;
  onAutoRefreshChange: (ms: number | null) => void;
}

export function LogViewerHeader({
  isLoading,
  totalCount,
  errorCount,
  warnCount,
  dataUpdatedAt,
  viewMode,
  onViewModeChange,
  rangeMs,
  onRangeChange,
  onRefresh,
  isFetching,
  autoRefreshMs,
  onAutoRefreshChange,
}: Props) {
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
          onRefresh={onRefresh}
          isFetching={isFetching}
          autoRefreshMs={autoRefreshMs}
          onAutoRefreshChange={onAutoRefreshChange}
        />
      </div>
    </header>
  );
}
