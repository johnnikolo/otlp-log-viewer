"use client";

import { memo } from "react";
import { TimeBucket } from "@/lib/transform";
import { ALL_SEVERITY_LEVELS, SEVERITY_HEX } from "@/lib/utils/severity";

interface Props {
  active?: boolean;
  payload?: Array<{ payload: TimeBucket }>;
}

function HistogramTooltipImpl({ active, payload }: Props) {
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

// recharts allocates a new `payload` array on every mousemove, so the default
// shallow compare never hits. Compare the hovered bucket instead: re-render
// only when the pointer crosses into a different bar.
export const HistogramTooltip = memo(
  HistogramTooltipImpl,
  (prev, next) =>
    prev.active === next.active &&
    prev.payload?.[0]?.payload?.time === next.payload?.[0]?.payload?.time,
);
