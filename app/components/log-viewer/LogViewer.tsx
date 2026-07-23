"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReloadIcon } from "@radix-ui/react-icons";
import { fetchLogs } from "@/lib/api";
import { transformLogs } from "@/lib/transform";
import { DEFAULT_TIME_RANGE_MS, filterByTimeRange } from "@/lib/timeRange";
import { getSeverityCounts } from "@/lib/utils";
import { Histogram } from "./histogram/Histogram";
import { HistogramSkeleton } from "./histogram/HistogramSkeleton";
import { LogTable } from "./table/LogTable";
import { TableSkeleton } from "./table/TableSkeleton";
import { GroupedLogView } from "./GroupedLogView";
import { LogViewerHeader } from "./LogViewerHeader";
import { ViewMode } from "./controls/ViewModeToggle";
import { ErrorOverlay } from "../ui/ErrorOverlay";

export function LogViewer() {
  const [viewMode, setViewMode] = useState<ViewMode>("flat");
  const [autoRefreshMs, setAutoRefreshMs] = useState<number | null>(null);
  const [rangeMs, setRangeMs] = useState<number | null>(DEFAULT_TIME_RANGE_MS);

  const {
    data: allRecords = [],
    isLoading,
    isError,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["logs"],
    queryFn: fetchLogs,
    select: transformLogs,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval: autoRefreshMs ?? false,
  });

  // Memoized so the filtered array keeps a stable reference across renders that
  // don't touch the data or range (e.g. isFetching toggling on every refetch).
  // This is what lets the memoized Histogram/LogTable/GroupedLogView below
  // actually skip work instead of re-rendering on every auto-refresh tick.
  const records = useMemo(
    () => filterByTimeRange(allRecords, rangeMs),
    [allRecords, rangeMs],
  );

  const totalCount = records.length;
  const { errorCount, warnCount } = useMemo(
    () => getSeverityCounts(records),
    [records],
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <LogViewerHeader
        isLoading={isLoading}
        totalCount={totalCount}
        errorCount={errorCount}
        warnCount={warnCount}
        dataUpdatedAt={dataUpdatedAt}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        rangeMs={rangeMs}
        onRangeChange={setRangeMs}
        onRefresh={() => refetch()}
        isFetching={isFetching}
        autoRefreshMs={autoRefreshMs}
        onAutoRefreshChange={setAutoRefreshMs}
      />

      <div className="flex-1 min-h-0 px-6 py-4 flex flex-col gap-4">
        {/* Histogram */}
        <div className="flex-shrink-0 bg-surface border border-line dark:bg-surface-dark dark:border-line-dark rounded-lg px-4 pt-3 pb-2">
          {isLoading ? (
            <>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2">
                Log Distribution
              </p>
              <div className="h-28 flex items-center justify-center text-gray-400 dark:text-gray-600 text-xs">
                Loading…
              </div>
            </>
          ) : isError ? (
            <>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2">
                Log Distribution
              </p>
              <ErrorOverlay
                skeleton={<HistogramSkeleton />}
                onRetry={() => refetch()}
                textSize="xs"
              />
            </>
          ) : (
            <Histogram records={records} rangeMs={rangeMs} />
          )}
        </div>

        {/* Log list */}
        <div className="flex-1 min-h-0 flex flex-col bg-surface border border-line dark:bg-surface-dark dark:border-line-dark rounded-lg overflow-hidden">
          {isLoading && (
            <div className="py-16 text-center text-gray-400 text-sm">
              <ReloadIcon className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
              Fetching logs…
            </div>
          )}

          {isError && (
            <ErrorOverlay
              skeleton={<TableSkeleton />}
              onRetry={() => refetch()}
              className="relative flex-1 min-h-0 overflow-hidden"
            />
          )}

          {!isLoading && !isError && viewMode === "flat" && (
            <LogTable records={records} />
          )}

          {!isLoading && !isError && viewMode === "grouped" && (
            <div className="flex-1 min-h-0 p-4 overflow-y-auto">
              <GroupedLogView records={records} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
