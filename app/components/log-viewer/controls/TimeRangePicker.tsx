"use client";

import { ClockIcon } from "@radix-ui/react-icons";
import { getRangeLabel } from "@/lib/timeRange";
import { TIME_RANGE_OPTIONS } from "@/lib/selectOptions";
import { DropdownSelect } from "../../ui/DropdownSelect";

interface Props {
  value: number | null;
  onChange: (ms: number | null) => void;
}

export function TimeRangePicker({ value, onChange }: Props) {
  return (
    <DropdownSelect
      options={TIME_RANGE_OPTIONS.map((o) => ({ label: o.label, value: o.ms }))}
      value={value}
      onChange={onChange}
      ariaLabel="Time range"
      triggerClassName="group flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors outline-none"
      triggerLabel={getRangeLabel(value)}
      icon={<ClockIcon className="w-3.5 h-3.5 text-gray-400" />}
    />
  );
}
