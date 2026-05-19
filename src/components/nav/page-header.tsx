import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  back?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, back, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-2 px-4 pt-4 pb-3",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {back && (
          <Link
            href={back}
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full bg-card-hover/40 text-text-secondary hover:text-text-primary hover:bg-card-hover"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
        )}
        <h1 className="truncate text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
