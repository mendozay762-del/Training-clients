import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionBlockProps {
  label: string;
  addHref?: string;
  viewHref?: string;
  count?: number;
  children?: React.ReactNode;
  empty?: string;
  className?: string;
}

export function SectionBlock({
  label,
  addHref,
  viewHref,
  count,
  children,
  empty,
  className,
}: SectionBlockProps) {
  const isEmpty = !children || (Array.isArray(children) && children.length === 0);
  return (
    <section className={cn("rounded-card bg-card p-4", className)}>
      <header className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          {label}
          {typeof count === "number" && count > 0 && (
            <span className="ml-1.5 text-text-tertiary">({count})</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {addHref && (
            <Link
              href={addHref}
              className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-card-hover hover:text-text-primary"
              aria-label={`Add ${label.toLowerCase()}`}
            >
              <Plus className="h-4 w-4" />
            </Link>
          )}
          {viewHref && (
            <Link
              href={viewHref}
              className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-card-hover hover:text-text-primary"
              aria-label={`View all ${label.toLowerCase()}`}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </header>
      <div className="mt-3">
        {isEmpty ? (
          <p className="text-sm text-text-tertiary">{empty ?? "Nothing yet."}</p>
        ) : (
          <div className="flex flex-col gap-2">{children}</div>
        )}
      </div>
      {viewHref && !isEmpty && (
        <Link
          href={viewHref}
          className="mt-3 inline-block text-sm font-medium text-accent-blue hover:underline"
        >
          View all →
        </Link>
      )}
    </section>
  );
}
