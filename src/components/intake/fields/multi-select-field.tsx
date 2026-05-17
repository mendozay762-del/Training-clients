"use client";

import { FieldLabel } from "./field-label";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectOption } from "./single-select-field";

interface MultiSelectFieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  required?: boolean;
  number?: number;
  options: SelectOption[];
  value: string[];
  onChange: (v: string[]) => void;
  otherValue?: string;
  onOtherChange?: (v: string) => void;
  otherKey?: string;
  otherPlaceholder?: string;
  error?: string;
}

export function MultiSelectField({
  label,
  hint,
  required,
  number,
  options,
  value,
  onChange,
  otherValue,
  onOtherChange,
  otherKey = "other",
  otherPlaceholder = "Please specify",
  error,
}: MultiSelectFieldProps) {
  function toggle(v: string) {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else {
      onChange([...value, v]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel required={required} number={number} hint={hint}>
        {label}
      </FieldLabel>
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => {
          const checked = value.includes(opt.value);
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={cn(
                "flex items-center gap-3 h-11 rounded-button px-3 border text-sm font-medium text-left transition-colors",
                checked
                  ? "bg-card-hover border-accent-blue/60 text-text-primary"
                  : "bg-card/60 border-border-subtle/40 text-text-secondary hover:text-text-primary",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                  checked
                    ? "bg-accent-blue border-accent-blue"
                    : "border-border-subtle",
                )}
              >
                {checked && <Check className="h-3.5 w-3.5 text-white" />}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>
      {value.includes(otherKey) && onOtherChange && (
        <input
          type="text"
          value={otherValue ?? ""}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder={otherPlaceholder}
          className="mt-1 w-full rounded-button bg-card-hover/60 border border-border-subtle/40 px-3 py-2.5 text-base text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue/60"
        />
      )}
      {error && <p className="text-xs text-accent-red">{error}</p>}
    </div>
  );
}
