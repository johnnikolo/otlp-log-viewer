"use client";

import dynamic from "next/dynamic";
import { ReloadIcon } from "@radix-ui/react-icons";
import { NormalizedLogRecord } from "@/types/otlp";
import { ErrorOverlay } from "../ui/ErrorOverlay";
import { LogTable } from "./table/LogTable";
import { TableSkeleton } from "./table/TableSkeleton";
import { ViewMode } from "./controls/ViewModeToggle";

// Grouped view is opt-in (default viewMode is "flat"), so defer its chunk
// (Radix Accordion + grouping logic) until the user actually switches to it.
const GroupedLogView = dynamic(
  () => import("./GroupedLogView").then((m) => m.GroupedLogView),
  { ssr: false, loading: () => <TableSkeleton /> },
);

type LogListPanelProps = {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  viewMode: ViewMode;
  records: NormalizedLogRecord[];
};

export function LogListPanel({
  isLoading,
  isError,
  onRetry,
  viewMode,
  records,
}: LogListPanelProps) {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-surface border border-line dark:bg-surface-dark dark:border-line-dark rounded-lg overflow-hidden">
      <LogListBody
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        viewMode={viewMode}
        records={records}
      />
    </div>
  );
}

function LogListBody({
  isLoading,
  isError,
  onRetry,
  viewMode,
  records,
}: LogListPanelProps) {
  if (isLoading) {
    return (
      <div className="py-16 text-center text-gray-400 text-sm">
        <ReloadIcon className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
        Fetching logs…
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorOverlay
        skeleton={<TableSkeleton />}
        onRetry={onRetry}
        className="relative flex-1 min-h-0 overflow-hidden"
      />
    );
  }

  if (viewMode === "grouped") {
    return (
      <div className="flex-1 min-h-0 p-4 overflow-y-auto">
        <GroupedLogView records={records} />
      </div>
    );
  }

  return <LogTable records={records} />;
}
