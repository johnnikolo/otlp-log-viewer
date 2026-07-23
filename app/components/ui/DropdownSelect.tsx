"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { ReactNode } from "react";

export interface DropdownOption<T> {
  label: string;
  value: T;
}

interface Props<T> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  triggerClassName: string;
  triggerLabel: ReactNode;
  icon?: ReactNode;
}

export function DropdownSelect<T>({
  options,
  value,
  onChange,
  ariaLabel,
  triggerClassName,
  triggerLabel,
  icon,
}: Props<T>) {
  const toKey = (v: T) => String(v);

  return (
    <Select.Root
      value={toKey(value)}
      onValueChange={(key) => {
        const opt = options.find((o) => toKey(o.value) === key);
        if (opt) onChange(opt.value);
      }}
    >
      <Select.Trigger aria-label={ariaLabel} className={triggerClassName}>
        {icon}
        <Select.Value>
          <span className="font-medium">{triggerLabel}</span>
        </Select.Value>
        <Select.Icon>
          <ChevronDownIcon className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={4}
          align="end"
          className="w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50 overflow-hidden"
        >
          <Select.Viewport>
            {options.map((opt) => (
              <Select.Item
                key={toKey(opt.value)}
                value={toKey(opt.value)}
                className="px-3 py-1.5 text-xs cursor-pointer outline-none hover:bg-gray-100 dark:hover:bg-gray-700 data-[state=checked]:text-indigo-600 dark:data-[state=checked]:text-indigo-400 data-[state=checked]:font-semibold text-gray-700 dark:text-gray-300 transition-colors"
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
