"use client";

import { NormalizedLogRecord } from "@/types/otlp";
import { LogBody } from "./LogBody";
import { formatFullTimestamp } from "@/lib/utils";
import { CopyableId } from "../../ui/CopyableId";

interface Props {
  record: NormalizedLogRecord;
}

export function LogDetail({ record }: Props) {
  return (
    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 dark:bg-gray-800/40 dark:border-gray-800 space-y-4">
      {/* Full body */}
      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
          Message
        </p>
        <LogBody body={record.body} bodyType={record.bodyType} expanded />
      </div>

      {/* Trace correlation */}
      {(record.traceId || record.spanId) && (
        <div className="flex flex-wrap items-center gap-4 text-xs bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded px-3 py-2">
          {record.traceId && <CopyableId label="Trace ID" value={record.traceId} />}
          {record.spanId && <CopyableId label="Span ID" value={record.spanId} />}
        </div>
      )}

      {/* Metadata row */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
        <div>
          <span className="text-gray-400 dark:text-gray-500">Timestamp</span>
          <span className="ml-2 font-mono text-gray-800 dark:text-gray-200">
            {formatFullTimestamp(record.timestampMs)}
          </span>
        </div>
        <div>
          <span className="text-gray-400 dark:text-gray-500">Severity #</span>
          <span className="ml-2 font-mono text-gray-800 dark:text-gray-200">
            {record.severityNumber}
          </span>
        </div>
        {record.serviceNamespace && (
          <div>
            <span className="text-gray-400 dark:text-gray-500">Namespace</span>
            <span className="ml-2 font-mono text-gray-800 dark:text-gray-200">
              {record.serviceNamespace}
            </span>
          </div>
        )}
        {record.serviceVersion && (
          <div>
            <span className="text-gray-400 dark:text-gray-500">Version</span>
            <span className="ml-2 font-mono text-gray-800 dark:text-gray-200">
              {record.serviceVersion}
            </span>
          </div>
        )}
      </div>

      {/* Attributes */}
      {record.attributes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
            Attributes
          </p>
          <table className="w-full text-xs">
            <tbody>
              {record.attributes.map((attr, index) => (
                <tr
                  key={`${attr.key}-${index}`}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <td className="py-1 pr-4 font-mono text-indigo-600 dark:text-indigo-400 whitespace-nowrap w-1/3">
                    {attr.key}
                  </td>
                  <td className="py-1 font-mono text-gray-700 dark:text-gray-300 break-all">
                    {String(attr.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
