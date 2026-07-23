"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";

export type ViewMode = "flat" | "grouped";

interface Props {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: Props) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as ViewMode);
      }}
      className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 text-xs"
    >
      <ToggleGroup.Item
        value="flat"
        className={`px-3 py-1 rounded-md transition-colors ${
          value === "flat"
            ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        Flat
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="grouped"
        className={`px-3 py-1 rounded-md transition-colors ${
          value === "grouped"
            ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        By Service
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}
