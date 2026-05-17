import { cn } from "@/lib/utils";

interface IntakeSectionCardProps {
  number: number;
  title: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function IntakeSectionCard({
  number,
  title,
  hint,
  children,
  className,
}: IntakeSectionCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-5 rounded-card bg-card p-5 border border-border-subtle/30",
        className,
      )}
    >
      <header className="flex flex-col gap-1">
        <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          Section {number}
        </div>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {hint && <p className="text-sm text-text-secondary">{hint}</p>}
      </header>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
