import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { NormalizedLogRecord } from "@/types/otlp";
import { formatTimestamp, formatRelativeTime } from "@/lib/utils";
import { SeverityBadge } from "../SeverityBadge";
import { LogBody } from "../detail/LogBody";
import {
  SEVERITY_WIDTH,
  TIME_WIDTH,
  SERVICE_WIDTH,
  BODY_MIN_WIDTH,
} from "./logTableLayout";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    cellClassName?: string;
  }
}

const columnHelper = createColumnHelper<NormalizedLogRecord>();

export const logTableColumns: ColumnDef<NormalizedLogRecord, any>[] = [
  columnHelper.accessor((row) => row.severityNumber, {
    id: "severity",
    header: "Severity",
    size: SEVERITY_WIDTH,
    meta: { cellClassName: "py-2 pr-3 whitespace-nowrap" },
    cell: (info) => <SeverityBadge severity={info.row.original.severityText} />,
  }),
  columnHelper.accessor("timestampMs", {
    id: "time",
    header: "Time",
    size: TIME_WIDTH,
    meta: { cellClassName: "py-2 pr-4 whitespace-nowrap" },
    cell: (info) => (
      <span
        className="font-mono text-xs text-gray-500 dark:text-gray-400"
        title={formatRelativeTime(info.getValue())}
      >
        {formatTimestamp(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("serviceName", {
    id: "service",
    header: "Service",
    size: SERVICE_WIDTH,
    meta: { cellClassName: "py-2 pr-4 whitespace-nowrap overflow-hidden" },
    cell: (info) => (
      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium font-mono truncate block">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("body", {
    id: "body",
    header: "Body",
    size: BODY_MIN_WIDTH,
    enableSorting: false,
    meta: { cellClassName: "py-2 pr-3" },
    cell: (info) => (
      <LogBody
        body={info.getValue()}
        bodyType={info.row.original.bodyType}
        expanded={false}
      />
    ),
  }),
];
