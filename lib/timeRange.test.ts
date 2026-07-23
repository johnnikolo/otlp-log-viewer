import {
  getTimestampSpanMs,
  resolveWindowMs,
  getRangeLabel,
  filterByTimeRange,
  DEFAULT_TIME_RANGE_MS,
} from "@/lib/timeRange";
import { NormalizedLogRecord } from "@/types/otlp";

const mk = (timestampMs: number): NormalizedLogRecord => ({
  id: Math.random().toString(),
  timestampMs,
  severityText: "INFO",
  severityNumber: 9,
  body: "x",
  bodyType: "text",
  attributes: [],
  serviceName: "svc",
  serviceNamespace: "",
  serviceVersion: "",
});

describe("getTimestampSpanMs", () => {
  it("returns the default range for an empty list", () => {
    expect(getTimestampSpanMs([])).toBe(DEFAULT_TIME_RANGE_MS);
  });

  it("returns the span from oldest to newest record", () => {
    // Values chosen well above the 60s floor guard below, so the real span
    // (not the floor) is what gets asserted.
    const records = [mk(1_000_000), mk(5_000_000), mk(3_000_000)];
    expect(getTimestampSpanMs(records)).toBe(4_000_000);
  });

  it("guards against a zero-width window (single record) to avoid divide-by-zero downstream", () => {
    const records = [mk(1_000)];
    expect(getTimestampSpanMs(records)).toBe(60_000);
  });
});

describe("resolveWindowMs", () => {
  it("returns the explicit range when provided", () => {
    expect(resolveWindowMs(3_600_000, [mk(0), mk(10_000_000)])).toBe(
      3_600_000,
    );
  });

  it("falls back to the data span when rangeMs is null (All time)", () => {
    const records = [mk(1_000_000), mk(5_000_000)];
    expect(resolveWindowMs(null, records)).toBe(4_000_000);
  });
});

describe("getRangeLabel", () => {
  it("labels a known preset", () => {
    expect(getRangeLabel(60 * 60 * 1000)).toBe("Last 1h");
  });

  it("labels null as All time", () => {
    expect(getRangeLabel(null)).toBe("All time");
  });

  it("falls back to 24h wording for an unrecognized value", () => {
    expect(getRangeLabel(999)).toBe("Last 24h");
  });
});

describe("filterByTimeRange", () => {
  it("returns all records unchanged when rangeMs is null", () => {
    const records = [mk(1_000), mk(2_000)];
    expect(filterByTimeRange(records, null)).toBe(records);
  });

  it("returns all records unchanged when there are none", () => {
    expect(filterByTimeRange([], 60_000)).toEqual([]);
  });

  it("keeps only records within rangeMs of the latest timestamp", () => {
    const records = [mk(0), mk(500_000), mk(1_000_000)];
    const result = filterByTimeRange(records, 600_000); // cutoff = 1,000,000 - 600,000 = 400,000
    expect(result.map((r) => r.timestampMs)).toEqual([500_000, 1_000_000]);
  });

  it("is inclusive of a record exactly at the cutoff", () => {
    const records = [mk(400_000), mk(1_000_000)];
    const result = filterByTimeRange(records, 600_000);
    expect(result).toHaveLength(2);
  });
});
