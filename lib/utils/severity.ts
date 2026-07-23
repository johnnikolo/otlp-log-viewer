import { NormalizedLogRecord, SeverityLevel } from "@/types/otlp";

// Severity → Tailwind color classes
export const SEVERITY_COLORS: Record<
  SeverityLevel,
  { badge: string; row: string; dot: string }
> = {
  UNSPECIFIED: {
    badge: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    row: "",
    dot: "bg-gray-400",
  },
  TRACE: {
    badge: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    row: "",
    dot: "bg-gray-400",
  },
  DEBUG: {
    badge: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    row: "",
    dot: "bg-blue-400",
  },
  INFO: {
    badge:
      "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    row: "",
    dot: "bg-green-500",
  },
  WARN: {
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    row: "bg-amber-50/30 dark:bg-amber-500/5",
    dot: "bg-amber-400",
  },
  ERROR: {
    badge: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    row: "bg-red-50/30 dark:bg-red-500/5",
    dot: "bg-red-500",
  },
  FATAL: {
    badge:
      "bg-red-200 text-red-900 font-bold dark:bg-red-500/20 dark:text-red-300",
    row: "bg-red-100/40 dark:bg-red-500/10",
    dot: "bg-red-700",
  },
};

// Severity order for sorting
export const SEVERITY_ORDER: Record<SeverityLevel, number> = {
  FATAL: 6,
  ERROR: 5,
  WARN: 4,
  INFO: 3,
  DEBUG: 2,
  TRACE: 1,
  UNSPECIFIED: 0,
};

// Every level, most severe first - the canonical iteration/display order for
// the histogram's stacked bars
export const ALL_SEVERITY_LEVELS: SeverityLevel[] = [
  "FATAL",
  "ERROR",
  "WARN",
  "INFO",
  "DEBUG",
  "TRACE",
  "UNSPECIFIED",
];

// Literal hex for contexts that can't use Tailwind classes (recharts fill).
export const SEVERITY_HEX: Record<SeverityLevel, string> = {
  FATAL: "#b91c1c", // red-700
  ERROR: "#ef4444", // red-500
  WARN: "#fbbf24", // amber-400
  INFO: "#22c55e", // green-500
  DEBUG: "#60a5fa", // blue-400
  TRACE: "#d1d5db", // gray-300
  UNSPECIFIED: "#9ca3af", // gray-400
};

// SeverityNumber thresholds per the OTel logs data model (ERROR 17-20,
// FATAL 21-24, WARN 13-16) - see severityFromNumber in lib/transform.ts.
export function isErrorSeverity(severityNumber: number): boolean {
  return severityNumber >= 17;
}

export function isWarnSeverity(severityNumber: number): boolean {
  return severityNumber >= 13 && severityNumber < 17;
}

export function getSeverityCounts(records: NormalizedLogRecord[]): {
  errorCount: number;
  warnCount: number;
} {
  let errorCount = 0;
  let warnCount = 0;
  for (const record of records) {
    if (isErrorSeverity(record.severityNumber)) errorCount++;
    else if (isWarnSeverity(record.severityNumber)) warnCount++;
  }
  return { errorCount, warnCount };
}
