"use client";

import { TimeBucket } from "@/lib/transform";
import { ALL_SEVERITY_LEVELS, SEVERITY_HEX } from "@/lib/utils";

interface Props {
  active?: boolean;
  payload?: Array<{ payload: TimeBucket }>;
}

export function HistogramTooltip({ active, payload }: Props) {
  if (!active || !payload?.length) return null;
  const bucket = payload[0].payload;

  return (
    <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 shadow-lg">
      <p className="font-mono text-gray-300 mb-1">
        {bucket.label} – {bucket.endLabel}
      </p>
      <p className="mb-1">
        Total: <span className="font-semibold text-white">{bucket.count}</span>
      </p>
      {ALL_SEVERITY_LEVELS.filter((level) => bucket.bySeverity[level] > 0).map(
        (level) => (
          <p key={level} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-sm flex-shrink-0"
              style={{ backgroundColor: SEVERITY_HEX[level] }}
            />
            <span>{level}:</span>{" "}
            <span className="font-semibold">{bucket.bySeverity[level]}</span>
          </p>
        ),
      )}
    </div>
  );
}
