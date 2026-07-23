"use client";

import { ReloadIcon } from "@radix-ui/react-icons";
import { DropdownSelect } from "../../ui/DropdownSelect";
import { AUTO_REFRESH_OPTIONS } from "@/lib/selectOptions";

interface Props {
  onRefresh: () => void;
  isFetching: boolean;
  autoRefreshMs: number | null;
  onAutoRefreshChange: (ms: number | null) => void;
}

export function RefreshControl({
  onRefresh,
  isFetching,
  autoRefreshMs,
  onAutoRefreshChange,
}: Props) {
  const currentLabel =
    AUTO_REFRESH_OPTIONS.find((o) => o.ms === autoRefreshMs)?.label ?? "Off";
  const isAutoOn = autoRefreshMs !== null;

  return (
    <div className="inline-flex text-xs rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Manual refresh */}
      <button
        onClick={onRefresh}
        disabled={isFetching}
        aria-label="Refresh now"
        title="Refresh now"
        className="flex items-center justify-center w-8 py-1.5 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
      >
        <ReloadIcon className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
      </button>

      <div className="w-px bg-gray-200 dark:bg-gray-700" />

      {/* Auto-refresh interval */}
      <DropdownSelect
        options={AUTO_REFRESH_OPTIONS.map((o) => ({ label: o.label, value: o.ms }))}
        value={autoRefreshMs}
        onChange={onAutoRefreshChange}
        ariaLabel="Auto-refresh interval"
        triggerClassName={`group flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors outline-none ${
          isAutoOn
            ? "text-green-600 dark:text-green-400"
            : "text-gray-500 dark:text-gray-400"
        }`}
        triggerLabel={`Auto: ${currentLabel}`}
        icon={
          isAutoOn ? (
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          ) : undefined
        }
      />
    </div>
  );
}
