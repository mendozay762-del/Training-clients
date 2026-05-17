import { cn } from "@/lib/utils";

interface FieldLabelProps {
  htmlFor?: string;
  required?: boolean;
  number?: number;
  children: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}

export function FieldLabel({
  htmlFor,
  required,
  number,
  children,
  hint,
  className,
}: FieldLabelProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-text-primary"
      >
        {typeof number === "number" && (
          <span className="mr-2 text-text-tertiary tabnums">{number}.</span>
        )}
        {children}
        {required && <span className="ml-1 text-accent-red">*</span>}
      </label>
      {hint && (
        <p className="text-xs text-text-tertiary">{hint}</p>
      )}
    </div>
  );
}
