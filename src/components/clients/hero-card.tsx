import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroCardProps {
  label: string;
  title: string;
  meta?: string;
  actionLabel?: string;
  href?: string;
  className?: string;
}

export function HeroCard({
  label,
  title,
  meta,
  actionLabel,
  href,
  className,
}: HeroCardProps) {
  const body = (
    <div className="flex items-center gap-3 rounded-card bg-card p-4 pl-5 transition-colors hover:bg-card-hover">
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-accent-blue"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-wider text-accent-blue">
          {label}
        </div>
        <div className="mt-0.5 truncate text-base font-semibold text-text-primary">
          {title}
        </div>
        {meta && (
          <div className="mt-0.5 truncate text-sm text-text-secondary">
            {meta}
          </div>
        )}
      </div>
      {actionLabel && (
        <div className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-accent-blue">
          {actionLabel}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("relative", className)}>
      {href ? <Link href={href}>{body}</Link> : body}
    </div>
  );
}
