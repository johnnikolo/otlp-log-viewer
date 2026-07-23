"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { memo, useMemo } from "react";
import { bucketByTime } from "@/lib/transform";
import { resolveWindowMs, getRangeLabel } from "@/lib/timeRange";
import { ALL_SEVERITY_LEVELS, SEVERITY_HEX } from "@/lib/utils";
import { NormalizedLogRecord } from "@/types/otlp";
import { HistogramTooltip } from "./HistogramTooltip";

interface Props {
  records: NormalizedLogRecord[];
  rangeMs: number | null;
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
            {/* One series per severity, stacked most-severe-first. */}
            {ALL_SEVERITY_LEVELS.map((level) => (
              <Bar
                key={level}
                dataKey={`bySeverity.${level}`}
                stackId="severity"
                fill={SEVERITY_HEX[level]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Memoized: props are just records + rangeMs, so unrelated LogViewer re-renders
// (e.g. isFetching toggling) skip re-rendering the recharts tree entirely.
export const Histogram = memo(HistogramImpl);
