"use client";

import { useState } from "react";

interface Props {
  label: string;
  value: string;
}

type CopyStatus = "idle" | "copied" | "error";

export function CopyableId({ label, value }: Props) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Can reject/throw in insecure (non-HTTPS) contexts or when the user
      // denies clipboard permission - surface a "Failed" state instead of
      // leaving an unhandled promise rejection and no feedback.
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 1200);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy to clipboard"
      className="flex items-center gap-1.5"
    >
      <span className="text-indigo-500 dark:text-indigo-400 font-semibold">
        {label}
      </span>
      <span className="font-mono text-gray-700 dark:text-gray-300">
        {value}
      </span>
      <span
        className={`text-xs w-10 text-left ${
          status === "error"
            ? "text-red-600 dark:text-red-400"
            : "text-green-600 dark:text-green-400"
        }`}
      >
        {status === "copied" ? "Copied" : status === "error" ? "Failed" : ""}
      </span>
    </button>
  );
}
