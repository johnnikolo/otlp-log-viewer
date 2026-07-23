import { IExportLogsServiceRequest } from "@/types/otlp";
import { exportLogsServiceRequestSchema } from "@/lib/otlpSchema";

const API_URL =
  "https://take-home-assignment-otlp-logs-api.vercel.app/api/v2/logs";

// Carries the HTTP status so callers (e.g. query retry logic) can
// distinguish transient failures (5xx, network) from permanent ones (4xx).
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function fetchLogs(
  signal?: AbortSignal,
): Promise<IExportLogsServiceRequest> {
  const res = await fetch(API_URL, { cache: "no-store", signal });
  if (!res.ok) {
    throw new ApiError(
      `Failed to fetch logs: ${res.status} ${res.statusText}`,
      res.status,
    );
  }
  const data = await res.json();
  return exportLogsServiceRequestSchema.parse(data);
}
