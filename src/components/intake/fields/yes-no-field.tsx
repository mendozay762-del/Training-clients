"use client";

import { FieldLabel } from "./field-label";
import { cn } from "@/lib/utils";

interface YesNoFieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  required?: boolean;
  number?: number;
  value: boolean | null;
  onChange: (v: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
  error?: string;
}

export function YesNoField({
  label,
  hint,
  required,
  number,
  value,
  onChange,
  yesLabel = "Yes",
  noLabel = "No",
  error,
}: YesNoFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel required={required} number={number} hint={hint}>
        {label}
      </FieldLabel>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "flex-1 h-12 rounded-btn border text-base font-medium transition-colors",
            value === false
              ? "bg-card-hover border-accent-blue/60 text-text-primary"
              : "bg-card/60 border-border-subtle/40 text-text-secondary hover:text-text-primary",
          )}
        >
          {noLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "flex-1 h-12 rounded-btn border text-base font-medium transition-colors",
            value === true
              ? "bg-card-hover border-accent-blue/60 text-text-primary"
              : "bg-card/60 border-border-subtle/40 text-text-secondary hover:text-text-primary",
          )}
        >
          {yesLabel}
        </button>
      </div>
      {error && <p className="text-xs text-accent-red">{error}</p>}
    </div>
  );
}
