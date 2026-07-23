"use client";

import { memo, useMemo } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { NormalizedLogRecord } from "@/types/otlp";
import { groupByService } from "@/lib/transform";
import { LogTable } from "./table/LogTable";
import { SeverityBadge } from "./SeverityBadge";
import { SEVERITY_ORDER, getSeverityCounts } from "@/lib/utils/severity";
import { formatCompactNumber } from "@/lib/utils/format";

interface Props {
  records: NormalizedLogRecord[];
}

function ServiceGroup({
  serviceName,
  records,
}: {
  serviceName: string;
  records: NormalizedLogRecord[];
}) {
  // Highest severity in this group
  const topSeverity = records.reduce((top, r) =>
    SEVERITY_ORDER[r.severityText] > SEVERITY_ORDER[top.severityText] ? r : top,
  ).severityText;

  const { errorCount, warnCount } = getSeverityCounts(records);

  return (
    <Accordion.Item
      value={serviceName}
      className="border border-line dark:border-line-dark rounded-lg overflow-hidden mb-3"
    >
      <Accordion.Header>
        <Accordion.Trigger className="group w-full flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/60 dark:hover:bg-gray-800 transition-colors text-left outline-none">
          <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 group-data-[state=closed]:-rotate-90" />

          <span className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-100 flex-1">
            {serviceName}
          </span>

          <div className="flex items-center gap-2 text-xs font-mono ml-auto">
            <span className="text-gray-500 dark:text-gray-400">
              <span className="text-gray-900 dark:text-white font-semibold">
                {formatCompactNumber(records.length)}
              </span>{" "}
              logs
            </span>
            {errorCount > 0 && (
              <span className="text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10 px-2 py-0.5 rounded">
                {formatCompactNumber(errorCount)} error &amp; fatal
              </span>
            )}
            {warnCount > 0 && (
              <span className="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 px-2 py-0.5 rounded">
                {formatCompactNumber(warnCount)} warn
              </span>
            )}
            <SeverityBadge severity={topSeverity} />
          </div>
        </Accordion.Trigger>
      </Accordion.Header>

      {/* Log table for this group */}
      <Accordion.Content>
        <LogTable records={records} maxHeight={360} virtualized={false} />
      </Accordion.Content>
    </Accordion.Item>
  );
}

function GroupedLogViewImpl({ records }: Props) {
  // Sort groups by highest severity first, then by log count. Memoized so the
  // grouping + sort only reruns when records actually change, not on every
  // unrelated parent re-render
  const sortedGroups = useMemo(() => {
    const groups = groupByService(records);
    return Array.from(groups.entries()).sort(([, aRecs], [, bRecs]) => {
      const aTop = Math.max(...aRecs.map((r) => r.severityNumber));
      const bTop = Math.max(...bRecs.map((r) => r.severityNumber));
      if (bTop !== aTop) return bTop - aTop;
      return bRecs.length - aRecs.length;
    });
  }, [records]);

  return (
    <Accordion.Root type="single" collapsible>
      {sortedGroups.map(([serviceName, serviceRecords]) => (
        <ServiceGroup
          key={serviceName}
          serviceName={serviceName}
          records={serviceRecords}
        />
      ))}
    </Accordion.Root>
  );
}

// Memoized: only prop is `records`, so a stable reference lets unrelated parent
// re-renders skip the grouping, sort, and every nested per-group LogTable.
export const GroupedLogView = memo(GroupedLogViewImpl);
