import {
  resolveTimestampMs,
  extractAttributeValue,
  detectBodyType,
  transformLogs,
  groupByService,
  bucketByTime,
} from "@/lib/transform";
import { exportRequest, logRecord, attr } from "@/lib/__fixtures__/otlp";
import { NormalizedLogRecord } from "@/types/otlp";

describe("resolveTimestampMs", () => {
  it("prefers timeUnixNano when present", () => {
    const nowNano = String(BigInt(1_700_000_000_000) * BigInt(1_000_000));
    const observedNano = String(BigInt(1_600_000_000_000) * BigInt(1_000_000));
    expect(resolveTimestampMs(nowNano, observedNano)).toBe(1_700_000_000_000);
  });

  it("falls back to observedTimeUnixNano when timeUnixNano is missing", () => {
    const observedNano = String(BigInt(1_600_000_000_000) * BigInt(1_000_000));
    expect(resolveTimestampMs(undefined, observedNano)).toBe(1_600_000_000_000);
  });

  it("falls back to Date.now() when both are missing", () => {
    const before = Date.now();
    const result = resolveTimestampMs(undefined, undefined);
    const after = Date.now();
    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });

  it("falls back to observed when timeUnixNano is invalid (unparseable)", () => {
    const observedNano = String(BigInt(1_600_000_000_000) * BigInt(1_000_000));
    expect(resolveTimestampMs("not-a-number", observedNano)).toBe(
      1_600_000_000_000,
    );
  });

  it("falls back to observed when timeUnixNano is zero (per OTel, 0 = unset)", () => {
    const observedNano = String(BigInt(1_600_000_000_000) * BigInt(1_000_000));
    expect(resolveTimestampMs("0", observedNano)).toBe(1_600_000_000_000);
  });
});

describe("extractAttributeValue", () => {
  it("extracts stringValue", () => {
    expect(extractAttributeValue({ stringValue: "hi" })).toBe("hi");
  });

  it("extracts intValue", () => {
    expect(extractAttributeValue({ intValue: 42 })).toBe(42);
  });

  it("extracts doubleValue", () => {
    expect(extractAttributeValue({ doubleValue: 3.14 })).toBe(3.14);
  });

  it("extracts boolValue, including literal false", () => {
    expect(extractAttributeValue({ boolValue: false })).toBe(false);
  });

  it("extracts bytesValue", () => {
    expect(extractAttributeValue({ bytesValue: "aGVsbG8=" })).toBe("aGVsbG8=");
  });

  it("stringifies arrayValue instead of dropping it", () => {
    const value = { arrayValue: { values: [{ intValue: 1 }] } };
    expect(extractAttributeValue(value)).toBe(JSON.stringify(value));
  });

  it("stringifies kvlistValue instead of dropping it", () => {
    const value = {
      kvlistValue: { values: [attr("k", { stringValue: "v" })] },
    };
    expect(extractAttributeValue(value)).toBe(JSON.stringify(value));
  });

  it("returns empty string when no known variant is set", () => {
    expect(extractAttributeValue({})).toBe("");
  });
});

describe("detectBodyType", () => {
  it("detects a JSON object body", () => {
    expect(detectBodyType('{"a": 1}')).toBe("json");
  });

  it("detects a JSON array body", () => {
    expect(detectBodyType("[1, 2, 3]")).toBe("json");
  });

  it("falls back to text when it looks like JSON but doesn't parse", () => {
    expect(detectBodyType("{not valid json}")).toBe("text");
  });

  it("detects a stack trace", () => {
    const body = "TypeError: bad thing\n    at foo (file.js:1:1)";
    expect(detectBodyType(body)).toBe("stacktrace");
  });

  it("defaults to text for a plain message", () => {
    expect(detectBodyType("user logged in")).toBe("text");
  });
});

describe("transformLogs", () => {
  it("flattens nested resourceLogs/scopeLogs/logRecords and pulls out service fields", () => {
    const request = exportRequest([
      {
        serviceName: "checkout",
        records: [logRecord({ body: { stringValue: "order placed" } })],
      },
    ]);
    const result = transformLogs(request);
    expect(result).toHaveLength(1);
    expect(result[0].serviceName).toBe("checkout");
    expect(result[0].body).toBe("order placed");
  });

  it("normalizes severityText from severityNumber when text is missing/unrecognized", () => {
    const request = exportRequest([
      {
        serviceName: "svc",
        records: [
          logRecord({ severityText: "", severityNumber: 19 }), // ERROR range
          logRecord({ severityText: "bogus", severityNumber: 5 }), // DEBUG range
        ],
      },
    ]);
    const [a, b] = transformLogs(request);
    expect(a.severityText).toBe("ERROR");
    expect(b.severityText).toBe("DEBUG");
  });

  it("keeps a valid severityText even if it disagrees with severityNumber's range", () => {
    const request = exportRequest([
      {
        serviceName: "svc",
        records: [logRecord({ severityText: "WARN", severityNumber: 1 })],
      },
    ]);
    expect(transformLogs(request)[0].severityText).toBe("WARN");
  });

  it("extracts trace/span correlation out of attributes and removes them from the rest", () => {
    const request = exportRequest([
      {
        serviceName: "svc",
        records: [
          logRecord({
            attributes: [
              attr("trace.id", { stringValue: "abc123" }),
              attr("span.id", { stringValue: "def456" }),
              attr("user.id", { stringValue: "u1" }),
            ],
          }),
        ],
      },
    ]);
    const [record] = transformLogs(request);
    expect(record.traceId).toBe("abc123");
    expect(record.spanId).toBe("def456");
    expect(record.attributes).toEqual([{ key: "user.id", value: "u1" }]);
  });

  it("sorts records newest-first across services", () => {
    const request = exportRequest([
      {
        serviceName: "svc-a",
        records: [
          logRecord({
            timeUnixNano: String(BigInt(1_000) * BigInt(1_000_000)),
          }),
        ],
      },
      {
        serviceName: "svc-b",
        records: [
          logRecord({
            timeUnixNano: String(BigInt(5_000) * BigInt(1_000_000)),
          }),
        ],
      },
    ]);
    const result = transformLogs(request);
    expect(result[0].serviceName).toBe("svc-b");
    expect(result[1].serviceName).toBe("svc-a");
  });

  it("gives every record a unique id even with identical service, timestamp, and body", () => {
    const sharedNano = String(BigInt(1_234) * BigInt(1_000_000));
    const request = exportRequest([
      {
        serviceName: "svc",
        records: [
          logRecord({ timeUnixNano: sharedNano, body: { stringValue: "dup" } }),
          logRecord({ timeUnixNano: sharedNano, body: { stringValue: "dup" } }),
        ],
      },
    ]);
    const result = transformLogs(request);
    expect(result[0].id).not.toBe(result[1].id);
  });

  it("tolerates a malformed response missing resourceLogs entirely", () => {
    expect(transformLogs({} as Parameters<typeof transformLogs>[0])).toEqual(
      [],
    );
  });

  it("tolerates a resourceLog missing scopeLogs, and a scopeLog missing logRecords", () => {
    const request = {
      resourceLogs: [
        { resource: { attributes: [] } },
        { resource: { attributes: [] }, scopeLogs: [{ scope: { name: "s" } }] },
      ],
    } as unknown as Parameters<typeof transformLogs>[0];
    expect(transformLogs(request)).toEqual([]);
  });
});

describe("groupByService", () => {
  const mk = (serviceName: string): NormalizedLogRecord => ({
    id: Math.random().toString(),
    timestampMs: Date.now(),
    severityText: "INFO",
    severityNumber: 9,
    body: "x",
    bodyType: "text",
    attributes: [],
    serviceName,
    serviceNamespace: "",
    serviceVersion: "",
  });

  it("groups records by serviceName", () => {
    const records = [mk("a"), mk("b"), mk("a")];
    const groups = groupByService(records);
    expect(groups.get("a")).toHaveLength(2);
    expect(groups.get("b")).toHaveLength(1);
  });

  it("falls back to 'unknown' for an empty service name", () => {
    const groups = groupByService([mk("")]);
    expect(groups.get("unknown")).toHaveLength(1);
  });
});

describe("bucketByTime", () => {
  const mk = (
    timestampMs: number,
    severityNumber = 9,
  ): NormalizedLogRecord => ({
    id: Math.random().toString(),
    timestampMs,
    severityText: severityNumber >= 17 ? "ERROR" : "INFO",
    severityNumber,
    body: "x",
    bodyType: "text",
    attributes: [],
    serviceName: "svc",
    serviceNamespace: "",
    serviceVersion: "",
  });

  it("returns an empty array for no records", () => {
    expect(bucketByTime([], 60_000, 24)).toEqual([]);
  });

  it("anchors the window to the newest record's timestamp, not wall clock", () => {
    const newest = 1_000_000;
    const records = [mk(newest), mk(newest - 500_000)];
    const buckets = bucketByTime(records, 1_000_000, 10);
    // Last bucket must end exactly at the newest timestamp.
    const lastBucket = buckets[buckets.length - 1];
    const bucketSize = 1_000_000 / 10;
    expect(lastBucket.time + bucketSize).toBe(newest);
  });

  it("counts records into the correct bucket, broken down by severity", () => {
    const newest = 1_000_000;
    const records = [
      mk(newest, 19), // ERROR, falls in the last bucket
      mk(newest, 9), // INFO, falls in the last bucket
    ];
    const buckets = bucketByTime(records, 1_000_000, 10);
    const lastBucket = buckets[buckets.length - 1];
    expect(lastBucket.count).toBe(2);
    expect(lastBucket.bySeverity.ERROR).toBe(1);
    expect(lastBucket.bySeverity.INFO).toBe(1);
    expect(lastBucket.bySeverity.WARN).toBe(0);
  });

  it("drops records that fall outside the requested window", () => {
    const newest = 10_000_000;
    const records = [mk(newest), mk(0)]; // way before the window start
    const buckets = bucketByTime(records, 1_000_000, 10);
    const totalCounted = buckets.reduce((sum, b) => sum + b.count, 0);
    expect(totalCounted).toBe(1);
  });

  it("computes an exact [time, endTime) range and matching labels per bucket", () => {
    const newest = 1_000_000;
    const records = [mk(newest)];
    const bucketCount = 10;
    const windowMs = 1_000_000;
    const bucketSize = windowMs / bucketCount;
    const buckets = bucketByTime(records, windowMs, bucketCount);

    expect(buckets).toHaveLength(bucketCount);
    buckets.forEach((bucket, i) => {
      expect(bucket.endTime).toBe(bucket.time + bucketSize);
      if (i > 0) expect(bucket.time).toBe(buckets[i - 1].endTime);
    });
  });
});
