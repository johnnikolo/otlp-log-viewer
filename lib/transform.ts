import {
  IExportLogsServiceRequest,
  IAttribute,
  IAttributeValue,
  NormalizedLogRecord,
  NormalizedAttribute,
  SeverityLevel,
  BodyType,
} from "@/types/otlp";
import { isErrorSeverity } from "@/lib/utils";

// BigInt nanoseconds → milliseconds, safely (avoids precision loss).
// Returns null for missing/invalid input rather than a fallback value, so
// callers can decide what to fall back to (see resolveTimestampMs below).
function parseNanoTimestamp(nanoStr: string | undefined): number | null {
  if (!nanoStr) return null;
  try {
    const ms = Number(BigInt(nanoStr) / BigInt(1_000_000));
    return ms > 0 ? ms : null;
  } catch {
    return null;
  }
}

// Per the OTel logs data model: "Use Timestamp if it is present, otherwise
// use ObservedTimestamp" - Timestamp (timeUnixNano) is when the event
// occurred at the source, ObservedTimestamp is when it was collected, and
// only differs when a producer can't attach an origin timestamp. Falling
// straight to Date.now() (as this used to) silently mislabels old logs as
// happening "now", corrupting sort order and the histogram.
export function resolveTimestampMs(
  timeUnixNano: string | undefined,
  observedTimeUnixNano: string | undefined,
): number {
  return (
    parseNanoTimestamp(timeUnixNano) ??
    parseNanoTimestamp(observedTimeUnixNano) ??
    Date.now()
  );
}

// Extract a typed value from an OTLP attribute value union
export function extractAttributeValue(
  value: IAttributeValue,
): string | number | boolean {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.intValue !== undefined) return value.intValue;
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.boolValue !== undefined) return value.boolValue;
  if (value.bytesValue !== undefined) return value.bytesValue;
  // Complex types (array/kvlist) have no first-class rendering; stringify so
  // the value stays visible instead of collapsing to an empty string.
  if (value.arrayValue || value.kvlistValue) return JSON.stringify(value);
  return "";
}

// Find a specific attribute by key from a list
export function findAttribute(attributes: IAttribute[], key: string): string {
  const attr = attributes.find((a) => a.key === key);
  if (!attr) return "";
  const val = extractAttributeValue(attr.value);
  return String(val);
}

// Normalize OTLP attribute list to flat key/value pairs
export function normalizeAttributes(
  attributes: IAttribute[],
): NormalizedAttribute[] {
  return attributes.map((attr) => ({
    key: attr.key,
    value: extractAttributeValue(attr.value),
  }));
}

const TRACE_ID_ATTR_KEY = "trace.id";
const SPAN_ID_ATTR_KEY = "span.id";

// The OTel logs data model defines dedicated TraceId/SpanId LogRecord fields
// for correlating a log with its trace - but this API doesn't populate those;
// instead it carries the same correlation data as plain attributes. Pull
// those out into dedicated fields so the UI can give them distinct treatment
// (rather than burying them in the generic attributes table), removing them
// from the returned attribute list to avoid showing the same data twice.
function extractTraceCorrelation(attributes: NormalizedAttribute[]): {
  traceId?: string;
  spanId?: string;
  rest: NormalizedAttribute[];
} {
  let traceId: string | undefined;
  let spanId: string | undefined;

  const rest = attributes.filter((attr) => {
    if (attr.key === TRACE_ID_ATTR_KEY) {
      traceId = String(attr.value);
      return false;
    }
    if (attr.key === SPAN_ID_ATTR_KEY) {
      spanId = String(attr.value);
      return false;
    }
    return true;
  });

  return { traceId, spanId, rest };
}

// Detect what kind of body we have for rendering purposes
export function detectBodyType(body: string): BodyType {
  const trimmed = body.trim();

  // Stack trace: starts with ErrorType: message followed by "at " frames
  if (/^\w+Error:/.test(trimmed) && trimmed.includes("\n    at ")) {
    return "stacktrace";
  }

  // JSON: starts with { or [
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // Not valid JSON despite looking like it
    }
  }

  return "text";
}

// Per the OTel logs data model, SeverityNumber (1-24) is the primary
// machine-readable severity field; SeverityText is an optional, secondary
// human-readable label. Ranges: TRACE 1-4, DEBUG 5-8, INFO 9-12, WARN 13-16,
// ERROR 17-20, FATAL 21-24, 0/out-of-range = unspecified.
function severityFromNumber(severityNumber: number): SeverityLevel {
  if (severityNumber >= 1 && severityNumber <= 4) return "TRACE";
  if (severityNumber >= 5 && severityNumber <= 8) return "DEBUG";
  if (severityNumber >= 9 && severityNumber <= 12) return "INFO";
  if (severityNumber >= 13 && severityNumber <= 16) return "WARN";
  if (severityNumber >= 17 && severityNumber <= 20) return "ERROR";
  if (severityNumber >= 21 && severityNumber <= 24) return "FATAL";
  return "UNSPECIFIED";
}

// Normalize severity to one of our known levels: prefer a valid SeverityText,
// but fall back to deriving it from SeverityNumber when the text is missing
// or unrecognized, rather than giving up to UNSPECIFIED.
function normalizeSeverity(
  text: string,
  severityNumber: number,
): SeverityLevel {
  const upper = text?.toUpperCase() as SeverityLevel;
  const valid: SeverityLevel[] = [
    "TRACE",
    "DEBUG",
    "INFO",
    "WARN",
    "ERROR",
    "FATAL",
  ];
  if (valid.includes(upper)) return upper;
  return severityFromNumber(severityNumber);
}

// Main transformation: flatten the nested OTLP structure into a list of log records
export function transformLogs(
  response: IExportLogsServiceRequest,
): NormalizedLogRecord[] {
  const records: NormalizedLogRecord[] = [];
  let index = 0;

  for (const resourceLog of response.resourceLogs) {
    const resourceAttrs = resourceLog.resource?.attributes ?? [];
    const serviceName = findAttribute(resourceAttrs, "service.name");
    const serviceNamespace = findAttribute(resourceAttrs, "service.namespace");
    const serviceVersion = findAttribute(resourceAttrs, "service.version");

    for (const scopeLog of resourceLog.scopeLogs) {
      for (const record of scopeLog.logRecords) {
        const timestampMs = resolveTimestampMs(
          record.timeUnixNano,
          record.observedTimeUnixNano,
        );
        const body = record.body?.stringValue ?? "";
        const bodyType = detectBodyType(body);
        const {
          traceId,
          spanId,
          rest: attributes,
        } = extractTraceCorrelation(
          normalizeAttributes(record.attributes ?? []),
        );

        records.push({
          // Collision-proof ID: service + timestamp + a monotonic index. The
          // first two alone can collide (same service emitting the same message
          // in the same nanosecond), so the index guarantees unique React keys.
          id: `${serviceName}-${record.timeUnixNano}-${index++}`,
          timestampMs,
          severityText: normalizeSeverity(
            record.severityText,
            record.severityNumber,
          ),
          severityNumber: record.severityNumber,
          body,
          bodyType,
          attributes,
          traceId,
          spanId,
          serviceName,
          serviceNamespace,
          serviceVersion,
        });
      }
    }
  }

  // Sort newest first
  return records.sort((a, b) => b.timestampMs - a.timestampMs);
}

// Group records by service name for the grouped view
export function groupByService(
  records: NormalizedLogRecord[],
): Map<string, NormalizedLogRecord[]> {
  const groups = new Map<string, NormalizedLogRecord[]>();

  for (const record of records) {
    const key = record.serviceName || "unknown";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(record);
  }

  return groups;
}

export interface TimeBucket {
  time: number;
  label: string;
  count: number;
  errors: number;
}

// Bucket records into time windows for the histogram. windowMs is owned by
// the caller (see lib/timeRange.ts) since the same window also drives
// filtering the table/grouped views - it's a global time-range concern, not
// something specific to the histogram.
export function bucketByTime(
  records: NormalizedLogRecord[],
  windowMs: number,
  bucketCount = 24,
): TimeBucket[] {
  if (records.length === 0) return [];

  // Anchor the window to the data's newest timestamp, not Date.now(). This
  // recomputes on every render, but the data only changes on refetch - so
  // anchoring to wall-clock time would make the window keep sliding forward
  // past a static dataset, falsely emptying the chart's trailing hours the
  // longer the page sits open unrefreshed.
  const latestTimestamp = records.reduce(
    (max, r) => Math.max(max, r.timestampMs),
    -Infinity,
  );
  const start = latestTimestamp - windowMs;
  const bucketSize = windowMs / bucketCount;
  // Once a bucket spans a full day or more, an hour:minute label can't tell
  // buckets on different days apart - show the date instead.
  const showDate = bucketSize >= 24 * 60 * 60 * 1000;

  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const bucketStart = start + i * bucketSize;
    return {
      time: bucketStart,
      label: showDate
        ? new Date(bucketStart).toLocaleDateString([], {
            month: "short",
            day: "numeric",
          })
        : new Date(bucketStart).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
      count: 0,
      errors: 0,
    };
  });

  for (const record of records) {
    const offset = record.timestampMs - start;
    const idx = Math.floor(offset / bucketSize);
    if (idx >= 0 && idx < bucketCount) {
      buckets[idx].count++;
      if (isErrorSeverity(record.severityNumber)) {
        buckets[idx].errors++;
      }
    }
  }

  return buckets;
}
