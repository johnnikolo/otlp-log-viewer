import { ReactNode } from "react";

interface Props {
  skeleton: ReactNode;
  onRetry: () => void;
  className?: string;
  textSize?: "xs" | "sm";
}

export function ErrorOverlay({
  skeleton,
  onRetry,
  className = "relative",
  textSize = "sm",
}: Props) {
  return (
    <div className={className}>
      {skeleton}
      <div className="absolute inset-0 flex items-center justify-center gap-3 bg-white/70 dark:bg-gray-900/70">
        <span
          className={`text-red-500 dark:text-red-400 ${
            textSize === "xs" ? "text-xs" : "text-sm"
          }`}
        >
          Failed to load logs.
        </span>
        <button
          onClick={onRetry}
          className={`px-3 ${
            textSize === "xs" ? "py-1" : "py-1.5"
          } text-xs bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors`}
        >
          Retry
        </button>
      </div>
    </div>
  );
}
