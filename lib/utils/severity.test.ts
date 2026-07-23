import {
  isErrorSeverity,
  isWarnSeverity,
  getSeverityCounts,
} from "@/lib/utils/severity";
import { NormalizedLogRecord } from "@/types/otlp";

describe("isErrorSeverity / isWarnSeverity", () => {
  // Per the OTel logs data model: WARN 13-16, ERROR 17-20, FATAL 21-24.
  it("treats 13-16 as warn, not error", () => {
    expect(isWarnSeverity(13)).toBe(true);
    expect(isWarnSeverity(16)).toBe(true);
    expect(isErrorSeverity(13)).toBe(false);
    expect(isErrorSeverity(16)).toBe(false);
  });

  it("treats 17+ as error (covers both ERROR and FATAL ranges)", () => {
    expect(isErrorSeverity(17)).toBe(true);
    expect(isErrorSeverity(24)).toBe(true);
    expect(isWarnSeverity(17)).toBe(false);
  });

  it("treats below 13 as neither", () => {
    expect(isWarnSeverity(12)).toBe(false);
    expect(isErrorSeverity(12)).toBe(false);
  });
});

describe("getSeverityCounts", () => {
  const mk = (severityNumber: number): NormalizedLogRecord => ({
    id: Math.random().toString(),
    timestampMs: 0,
    severityText: "INFO",
    severityNumber,
    body: "x",
    bodyType: "text",
    attributes: [],
    serviceName: "svc",
    serviceNamespace: "",
    serviceVersion: "",
  });

  it("tallies error and warn counts, ignoring info/debug/trace", () => {
    const records = [mk(9), mk(13), mk(17), mk(21), mk(5)];
    expect(getSeverityCounts(records)).toEqual({ errorCount: 2, warnCount: 1 });
  });

  it("returns zeros for an empty list", () => {
    expect(getSeverityCounts([])).toEqual({ errorCount: 0, warnCount: 0 });
  });
});
