// Test-only fixture builders for the raw OTLP wire shape, so unit tests can
// construct realistic IExportLogsServiceRequest payloads without repeating
// the nested resourceLogs/scopeLogs/logRecords boilerplate every time.
import {
  IExportLogsServiceRequest,
  IAttribute,
  ILogRecord,
} from "@/types/otlp";

export function attr(key: string, value: IAttribute["value"]): IAttribute {
  return { key, value };
}

export function logRecord(overrides: Partial<ILogRecord> = {}): ILogRecord {
  return {
    timeUnixNano: String(BigInt(Date.now()) * BigInt(1_000_000)),
    severityNumber: 9,
    severityText: "INFO",
    body: { stringValue: "hello" },
    attributes: [],
    droppedAttributesCount: 0,
    ...overrides,
  };
}

export function exportRequest(
  services: Array<{ serviceName: string; records: ILogRecord[] }>,
): IExportLogsServiceRequest {
  return {
    resourceLogs: services.map(({ serviceName, records }) => ({
      resource: {
        attributes: [attr("service.name", { stringValue: serviceName })],
      },
      scopeLogs: [
        {
          scope: { name: "test-scope" },
          logRecords: records,
        },
      ],
    })),
  };
}
