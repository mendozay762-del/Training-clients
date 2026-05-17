"use client";

import { FieldLabel } from "./field-label";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SingleSelectFieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  required?: boolean;
  number?: number;
  options: SelectOption[];
  value: string | null;
  onChange: (v: string) => void;
  otherValue?: string;
  onOtherChange?: (v: string) => void;
  otherKey?: string;
  otherPlaceholder?: string;
  error?: string;
}

export function SingleSelectField({
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
}: SingleSelectFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel required={required} number={number} hint={hint}>
        {label}
      </FieldLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            type="button"
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "h-11 rounded-button px-4 border text-sm font-medium transition-colors",
              value === opt.value
                ? "bg-card-hover border-accent-blue/60 text-text-primary"
                : "bg-card/60 border-border-subtle/40 text-text-secondary hover:text-text-primary",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {value === otherKey && onOtherChange && (
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
