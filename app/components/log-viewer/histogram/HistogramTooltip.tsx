"use client";

import { TimeBucket } from "@/lib/transform";

interface Props {
  active?: boolean;
  payload?: Array<{ payload: TimeBucket }>;
  label?: string;
}

export function HistogramTooltip({ active, payload, label }: Props) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 shadow-lg">
      <p className="font-mono text-gray-300 mb-1">{label}</p>
      <p>
        Total: <span className="font-semibold text-white">{data.count}</span>
      </p>
      {data.errors > 0 && (
        <p>
          Errors:{" "}
          <span className="font-semibold text-red-400">{data.errors}</span>
        </p>
      )}
    </div>
  );
}
