"use client";

import { FieldLabel } from "./field-label";
import { cn } from "@/lib/utils";

interface ScaleFieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  required?: boolean;
  number?: number;
  value: number | null;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  error?: string;
}

export function ScaleField({
  label,
  hint,
  required,
  number,
  value,
  onChange,
  min = 1,
  max = 10,
  minLabel,
  maxLabel,
  error,
}: ScaleFieldProps) {
  const items = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel required={required} number={number} hint={hint}>
        {label}
      </FieldLabel>
      <div className="flex gap-1.5">
        {items.map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              "h-11 flex-1 rounded-button border text-sm font-semibold tabnums transition-colors",
              value === n
                ? "bg-accent-blue border-accent-blue text-white"
                : "bg-card/60 border-border-subtle/40 text-text-secondary hover:text-text-primary",
            )}
          >
            {n}
          </button>
        ))}
      </div>
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-[11px] text-text-tertiary">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
      {error && <p className="text-xs text-accent-red">{error}</p>}
    </div>
  );
}
