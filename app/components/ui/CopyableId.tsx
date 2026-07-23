"use client";

import { useState } from "react";

interface Props {
  label: string;
  value: string;
}

export function CopyableId({ label, value }: Props) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
      title="Copy to clipboard"
      className="flex items-center gap-1.5"
    >
      <span className="text-indigo-500 dark:text-indigo-400 font-semibold">
        {label}
      </span>
      <span className="font-mono text-gray-700 dark:text-gray-300">
        {value}
      </span>
      <span className="text-xs text-green-600 dark:text-green-400 w-10 text-left">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
