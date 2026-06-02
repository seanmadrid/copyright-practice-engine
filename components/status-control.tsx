"use client";

import type { Status } from "@/lib/types";
import type { StatusOption } from "@/lib/structure-model";
import { cn } from "@/lib/utils";

/** Look up a status label from a structure's option list. */
export function statusLabel(options: StatusOption[], value: Status): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

/**
 * The call control for one unit. Renders the structure's status options as a
 * segmented radio group — three directions for fair use, met/fails for the
 * element test. The same component drives both; only the options differ.
 */
export function StatusControl({
  name,
  options,
  value,
  onChange,
  disabled,
}: {
  name: string;
  options: StatusOption[];
  value: Status | null;
  onChange?: (s: Status) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className="grid gap-1.5"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            data-active={active}
            onClick={() => onChange?.(opt.value)}
            className={cn(
              opt.className,
              "rounded-md border px-2 py-2 text-xs font-medium transition-colors",
              "border-input bg-background text-foreground",
              !disabled && "hover:bg-accent",
              disabled && "cursor-default opacity-90",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
