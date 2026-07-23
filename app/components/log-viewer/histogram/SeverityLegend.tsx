import { memo } from "react";
import { ALL_SEVERITY_LEVELS, SEVERITY_HEX } from "@/lib/utils";

// A static color key for the stacked histogram
function SeverityLegendImpl() {
  return (
    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
      {ALL_SEVERITY_LEVELS.map((level) => (
        <span
          key={level}
          className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"
        >
          <span
            className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
            style={{ backgroundColor: SEVERITY_HEX[level] }}
          />
          {level}
        </span>
      ))}
    </div>
  );
}

// Memoized: zero props and fully static output, so it should never re-render
// past its first mount.
export const SeverityLegend = memo(SeverityLegendImpl);
