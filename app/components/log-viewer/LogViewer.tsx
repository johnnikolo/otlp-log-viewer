"use client";

import { useMemo, useState } from "react";
import { useLogsQuery } from "@/lib/useLogsQuery";
import { DEFAULT_TIME_RANGE_MS, filterByTimeRange } from "@/lib/timeRange";
import { getSeverityCounts } from "@/lib/utils/severity";
import { LogViewerHeader } from "./LogViewerHeader";
import { ViewMode } from "./controls/ViewModeToggle";
import { HistogramPanel } from "./histogram/HistogramPanel";
import { LogListPanel } from "./LogListPanel";

export function LogViewer() {
  const [viewMode, setViewMode] = useState<ViewMode>("flat");
  const [rangeMs, setRangeMs] = useState<number | null>(DEFAULT_TIME_RANGE_MS);

  // isFetching/dataUpdatedAt/auto-refresh live in LogViewerHeader's own query call.
  const { data: allRecords = [], isLoading, isError, refetch } = useLogsQuery();

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
        totalCount={totalCount}
        errorCount={errorCount}
        warnCount={warnCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        rangeMs={rangeMs}
        onRangeChange={setRangeMs}
      />

      <div className="flex-1 min-h-0 px-6 py-4 flex flex-col gap-4">
        <HistogramPanel
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          records={records}
          rangeMs={rangeMs}
        />
        <LogListPanel
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          viewMode={viewMode}
          records={records}
        />
      </div>
    </div>
  );
}
