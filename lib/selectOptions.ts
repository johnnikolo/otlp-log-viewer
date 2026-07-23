export interface TimeRangeOption {
  label: string;
  ms: number | null; // null = "All time" (full span of the data)
}

export const DEFAULT_TIME_RANGE_MS = 24 * 60 * 60 * 1000;

// TimeRangePicker's dropdown - also drives histogram bucketing and
// table/grouped-view filtering (see lib/timeRange.ts).
export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { label: "1h", ms: 60 * 60 * 1000 },
  { label: "6h", ms: 6 * 60 * 60 * 1000 },
  { label: "24h", ms: DEFAULT_TIME_RANGE_MS },
  { label: "7d", ms: 7 * 24 * 60 * 60 * 1000 },
  { label: "All", ms: null },
];

export interface AutoRefreshOption {
  label: string;
  ms: number | null; // null = Off
}

// RefreshControl's auto-refresh interval dropdown.
export const AUTO_REFRESH_OPTIONS: AutoRefreshOption[] = [
  { label: "Off", ms: null },
  { label: "5s", ms: 5_000 },
  { label: "10s", ms: 10_000 },
  { label: "30s", ms: 30_000 },
  { label: "1m", ms: 60_000 },
];
