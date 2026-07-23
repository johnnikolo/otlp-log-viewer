"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { memo, useMemo } from "react";
import { bucketByTime } from "@/lib/transform";
import { resolveWindowMs, getRangeLabel } from "@/lib/timeRange";
import { NormalizedLogRecord } from "@/types/otlp";
import { HistogramTooltip } from "./HistogramTooltip";

interface Props {
  records: NormalizedLogRecord[];
  rangeMs: number | null;
}

const BAR_COLOR = {
  clean: "#6366f1", // indigo-500 — no errors in this bucket
  someErrors: "#f97316", // orange-500 — errors are a minority
  mostlyErrors: "#ef4444", // red-500 — errors are the majority
};

function barColor(errors: number, count: number): string {
  if (errors === 0) return BAR_COLOR.clean;
  return errors / count > 0.5 ? BAR_COLOR.mostlyErrors : BAR_COLOR.someErrors;
}

function HistogramImpl({ records, rangeMs }: Props) {
  const buckets = useMemo(() => {
    const windowMs = resolveWindowMs(rangeMs, records);
    return bucketByTime(records, windowMs, 24);
  }, [records, rangeMs]);

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2">
        Log Distribution — {getRangeLabel(rangeMs)}
      </p>

      <div className="w-full h-28">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={buckets}
            margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
            barCategoryGap="10%"
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#9ca3af", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={<HistogramTooltip />}
              cursor={{ fill: "rgba(99,102,241,0.08)" }}
            />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {buckets.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={barColor(entry.errors, entry.count)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Memoized: props are just records + rangeMs, so unrelated LogViewer re-renders
// (e.g. isFetching toggling) skip re-rendering the recharts tree entirely.
export const Histogram = memo(HistogramImpl);
