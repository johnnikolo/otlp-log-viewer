import { NormalizedLogRecord } from "@/types/otlp";
import { DEFAULT_TIME_RANGE_MS, TIME_RANGE_OPTIONS } from "@/lib/selectOptions";

export { DEFAULT_TIME_RANGE_MS };

function getLatestTimestamp(records: NormalizedLogRecord[]): number {
  return records.reduce((max, r) => Math.max(max, r.timestampMs), -Infinity);
}

// Span from the oldest to the newest record, for the "All time" option.
export function getTimestampSpanMs(records: NormalizedLogRecord[]): number {
  if (records.length === 0) return DEFAULT_TIME_RANGE_MS;
  let min = Infinity;
  const max = getLatestTimestamp(records);
  for (const r of records) {
    if (r.timestampMs < min) min = r.timestampMs;
  }
  // Guard against a zero-width window (e.g. a single record), which would
  // make bucketSize 0 and divide-by-zero in bucketByTime.
  return Math.max(max - min, 60_000);
}

export function resolveWindowMs(
  rangeMs: number | null,
  records: NormalizedLogRecord[],
): number {
  return rangeMs ?? getTimestampSpanMs(records);
}

export function getRangeLabel(rangeMs: number | null): string {
  if (rangeMs === null) return "All time";
  const opt = TIME_RANGE_OPTIONS.find((o) => o.ms === rangeMs);
  return `Last ${opt?.label ?? "24h"}`;
}

export function filterByTimeRange(
  records: NormalizedLogRecord[],
  rangeMs: number | null,
): NormalizedLogRecord[] {
  if (rangeMs === null || records.length === 0) return records;
  const latest = getLatestTimestamp(records);
  const cutoff = latest - rangeMs;
  return records.filter((r) => r.timestampMs >= cutoff);
}
