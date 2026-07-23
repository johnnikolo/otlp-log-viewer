import { IExportLogsServiceRequest } from "@/types/otlp";

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

export async function fetchLogs(): Promise<IExportLogsServiceRequest> {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new ApiError(
      `Failed to fetch logs: ${res.status} ${res.statusText}`,
      res.status
    );
  }
  return res.json();
}
