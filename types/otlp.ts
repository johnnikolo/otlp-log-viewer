// Raw OTLP types as returned by the API
export interface IAttributeValue {
  stringValue?: string;
  intValue?: number;
  doubleValue?: number;
  boolValue?: boolean;
  bytesValue?: string;
  // Complex OTLP AnyValue variants. Not rendered structurally, but declared so
  // extractAttributeValue can stringify them instead of silently dropping them.
  arrayValue?: { values: IAttributeValue[] };
  kvlistValue?: { values: IAttribute[] };
}

export interface IAttribute {
  key: string;
  value: IAttributeValue;
}

export interface ILogRecord {
  timeUnixNano: string; // BigInt serialized as string
  observedTimeUnixNano?: string;
  severityNumber: number;
  severityText: string;
  body: { stringValue: string };
  attributes: IAttribute[];
  droppedAttributesCount: number;
}

export interface IScopeLogs {
  scope: {
    name: string;
    attributes?: IAttribute[];
    droppedAttributesCount?: number;
  };
  logRecords: ILogRecord[];
}

export interface IResourceLogs {
  resource: {
    attributes: IAttribute[];
    droppedAttributesCount?: number;
  };
  scopeLogs: IScopeLogs[];
}

export interface IExportLogsServiceRequest {
  resourceLogs: IResourceLogs[];
}

// Normalized types used in the UI
export type SeverityLevel =
  | "UNSPECIFIED"
  | "TRACE"
  | "DEBUG"
  | "INFO"
  | "WARN"
  | "ERROR"
  | "FATAL";

export type BodyType = "text" | "json" | "stacktrace";

export interface NormalizedAttribute {
  key: string;
  value: string | number | boolean;
}

export interface NormalizedLogRecord {
  id: string;
  timestampMs: number;
  severityText: SeverityLevel;
  severityNumber: number;
  body: string;
  bodyType: BodyType;
  attributes: NormalizedAttribute[];
  // Trace/span correlation, extracted out of attributes (see extractTraceCorrelation)
  traceId?: string;
  spanId?: string;
  // From parent resource
  serviceName: string;
  serviceNamespace: string;
  serviceVersion: string;
}
