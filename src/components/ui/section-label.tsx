import { cn } from "@/lib/utils";

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-xs font-medium uppercase tracking-wider text-text-secondary",
        className,
      )}
    >
      {children}
    </h2>
  );
}
