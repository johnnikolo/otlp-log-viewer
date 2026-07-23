import { z } from "zod";
import {
  IAttribute,
  IAttributeValue,
  IExportLogsServiceRequest,
} from "@/types/otlp";

// Mirrors the raw OTLP interfaces in types/otlp.ts, used to validate
// fetchLogs's response at runtime (see lib/api.ts). Kept as a separate file
// since IAttributeValue/IAttribute are mutually recursive and need an
// explicit z.ZodType<T> hint that zod can't infer on its own.
const attributeValueSchema: z.ZodType<IAttributeValue> = z.lazy(() =>
  z.object({
    stringValue: z.string().optional(),
    intValue: z.number().optional(),
    doubleValue: z.number().optional(),
    boolValue: z.boolean().optional(),
    bytesValue: z.string().optional(),
    arrayValue: z.object({ values: z.array(attributeValueSchema) }).optional(),
    kvlistValue: z.object({ values: z.array(attributeSchema) }).optional(),
  }),
);

const attributeSchema: z.ZodType<IAttribute> = z.lazy(() =>
  z.object({
    key: z.string(),
    value: attributeValueSchema,
  }),
);

const logRecordSchema = z.object({
  timeUnixNano: z.string(),
  observedTimeUnixNano: z.string().optional(),
  severityNumber: z.number(),
  severityText: z.string(),
  body: z.object({ stringValue: z.string() }),
  attributes: z.array(attributeSchema),
  droppedAttributesCount: z.number(),
});

const scopeLogsSchema = z.object({
  scope: z.object({
    name: z.string(),
    attributes: z.array(attributeSchema).optional(),
    droppedAttributesCount: z.number().optional(),
  }),
  logRecords: z.array(logRecordSchema),
});

const resourceLogsSchema = z.object({
  resource: z.object({
    attributes: z.array(attributeSchema),
    droppedAttributesCount: z.number().optional(),
  }),
  scopeLogs: z.array(scopeLogsSchema),
});

export const exportLogsServiceRequestSchema: z.ZodType<IExportLogsServiceRequest> =
  z.object({
    resourceLogs: z.array(resourceLogsSchema),
  });
