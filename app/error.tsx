"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Something went wrong while rendering the log viewer.
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
