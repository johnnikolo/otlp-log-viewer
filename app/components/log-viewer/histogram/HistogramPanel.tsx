"use client";

import dynamic from "next/dynamic";
import { NormalizedLogRecord } from "@/types/otlp";
import { ErrorOverlay } from "../../ui/ErrorOverlay";
import { HistogramSkeleton } from "./HistogramSkeleton";
import { SeverityLegend } from "./SeverityLegend";

// recharts is a heavy dependency only needed once data has loaded successfully.
const Histogram = dynamic(
  () => import("./Histogram").then((m) => m.Histogram),
  { ssr: false, loading: () => <HistogramSkeleton /> },
);

type HistogramPanelProps = {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  records: NormalizedLogRecord[];
  rangeMs: number | null;
};

export function HistogramPanel({
  isLoading,
  isError,
  onRetry,
  records,
  rangeMs,
}: HistogramPanelProps) {
  return (
    <div className="flex-shrink-0 bg-surface border border-line dark:bg-surface-dark dark:border-line-dark rounded-lg px-4 pt-3 pb-2">
      <PanelTitle isLoading={isLoading} isError={isError} />
      <HistogramBody
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        records={records}
        rangeMs={rangeMs}
      />
    </div>
  );
}

function PanelTitle({
  isLoading,
  isError,
}: {
  isLoading: boolean;
  isError: boolean;
}) {
  if (!isLoading && !isError) return null; // success state renders its own legend instead
  return (
    <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2">
      Log Distribution
    </p>
  );
}

function HistogramBody({
  isLoading,
  isError,
  onRetry,
  records,
  rangeMs,
}: HistogramPanelProps) {
  if (isLoading) {
    return (
      <div className="h-28 flex items-center justify-center text-gray-400 dark:text-gray-600 text-xs">
        Loading…
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorOverlay
        skeleton={<HistogramSkeleton />}
        onRetry={onRetry}
        textSize="xs"
      />
    );
  }

  return (
    <>
      <Histogram records={records} rangeMs={rangeMs} />
      <SeverityLegend />
    </>
  );
}
