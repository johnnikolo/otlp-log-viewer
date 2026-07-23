import { logTableColumns } from "./logTableColumns";
import { NormalizedLogRecord } from "@/types/otlp";

const record: NormalizedLogRecord = {
  id: "1",
  timestampMs: Date.parse("2024-01-01T00:00:00.000Z"),
  severityText: "ERROR",
  severityNumber: 17,
  body: "something broke",
  bodyType: "text",
  attributes: [],
  serviceName: "checkout",
  serviceNamespace: "",
  serviceVersion: "",
};

describe("logTableColumns", () => {
  it("defines exactly the severity/time/service/body columns, in order", () => {
    expect(logTableColumns.map((c) => c.id)).toEqual([
      "severity",
      "time",
      "service",
      "body",
    ]);
  });

  // "disables sorting on the body column only" and "renders cells via their
  // cell renderers" are already exercised through real rendering + sorting
  // interactions in LogTable.test.tsx; not duplicated here.

  it("sorts the severity column by severityNumber, not severityText", () => {
    const severityCol = logTableColumns.find((c) => c.id === "severity")!;
    // accessorFn-based column: verify it derives from severityNumber by reading
    // the raw accessor rather than re-deriving the sort behavior indirectly.
    const accessorFn = (severityCol as { accessorFn?: (row: NormalizedLogRecord) => unknown })
      .accessorFn;
    expect(accessorFn?.(record)).toBe(17);
  });
});
