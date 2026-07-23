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
import { bucketByTime } from "@/lib/transform";
import { resolveWindowMs, getRangeLabel } from "@/lib/timeRange";
import { NormalizedLogRecord } from "@/types/otlp";
import { HistogramTooltip } from "./HistogramTooltip";

interface Props {
  records: NormalizedLogRecord[];
  rangeMs: number | null;
}

export function Histogram({ records, rangeMs }: Props) {
  const windowMs = resolveWindowMs(rangeMs, records);
  const buckets = bucketByTime(records, windowMs, 24);

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
            <Tooltip content={<HistogramTooltip />} cursor={{ fill: "rgba(99,102,241,0.08)" }} />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {buckets.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.errors > 0
                      ? entry.errors / entry.count > 0.5
                        ? "#ef4444" // mostly errors: red
                        : "#f97316" // some errors: orange
                      : "#6366f1" // no errors: indigo
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
