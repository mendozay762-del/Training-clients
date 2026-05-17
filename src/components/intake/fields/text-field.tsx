"use client";

import { forwardRef } from "react";
import { FieldLabel } from "./field-label";
import { cn } from "@/lib/utils";

interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  required?: boolean;
  number?: number;
  multiline?: boolean;
  rows?: number;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, hint, required, number, multiline, rows = 3, error, className, id, ...rest },
    ref,
  ) {
    const fieldId = id ?? rest.name;
    const inputClass = cn(
      "w-full rounded-button bg-card-hover/60 border border-border-subtle/40 px-3 py-2.5 text-base text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue/60 transition-colors",
      error && "border-accent-red/60",
      className,
    );

    return (
      <div className="flex flex-col gap-2">
        <FieldLabel
          htmlFor={fieldId}
          required={required}
          number={number}
          hint={hint}
        >
          {label}
        </FieldLabel>
        {multiline ? (
          <textarea
            id={fieldId}
            rows={rows}
            className={inputClass}
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref}
            id={fieldId}
            className={inputClass}
            {...rest}
          />
        )}
        {error && <p className="text-xs text-accent-red">{error}</p>}
      </div>
    );
  },
);
