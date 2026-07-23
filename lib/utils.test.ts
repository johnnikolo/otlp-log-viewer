import {
  isErrorSeverity,
  isWarnSeverity,
  getSeverityCounts,
  formatCompactNumber,
  prettyPrintJson,
} from "@/lib/utils";
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

describe("formatCompactNumber", () => {
  it("formats large numbers with a compact suffix", () => {
    // maximumFractionDigits: 1, so this rounds to one decimal, not truncates.
    expect(formatCompactNumber(141_234)).toBe("141.2K");
  });

  it("leaves small numbers as-is", () => {
    expect(formatCompactNumber(42)).toBe("42");
  });
});

describe("prettyPrintJson", () => {
  it("pretty-prints valid JSON", () => {
    expect(prettyPrintJson('{"a":1}')).toBe(JSON.stringify({ a: 1 }, null, 2));
  });

  it("returns the original string when it isn't valid JSON", () => {
    expect(prettyPrintJson("not json")).toBe("not json");
  });
});
