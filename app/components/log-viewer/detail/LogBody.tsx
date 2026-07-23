"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { BodyType } from "@/types/otlp";
import { prettyPrintJson } from "@/lib/utils/format";

interface Props {
  body: string;
  bodyType: BodyType;
  expanded?: boolean;
}

export function LogBody({ body, bodyType, expanded }: Props) {
  if (!expanded) {
    const preview = body.replace(/\n/g, " ");
    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="block font-mono text-xs text-gray-700 dark:text-gray-300 truncate cursor-default">
            {preview}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            align="start"
            sideOffset={6}
            className="max-w-md bg-gray-900 dark:bg-gray-800 dark:border dark:border-gray-700 text-gray-100 text-xs font-mono rounded px-3 py-2 shadow-lg z-50 break-words"
          >
            {preview}
            <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-800" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }

  if (bodyType === "json") {
    return (
      <pre className="font-mono text-xs bg-gray-950 text-green-300 rounded p-3 overflow-x-auto whitespace-pre-wrap break-all">
        {prettyPrintJson(body)}
      </pre>
    );
  }

  if (bodyType === "stacktrace") {
    return (
      <pre className="font-mono text-xs bg-gray-950 text-red-300 rounded p-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
        {body}
      </pre>
    );
  }

  return (
    <p className="font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
      {body}
    </p>
  );
}
