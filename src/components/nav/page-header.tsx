import { cn } from "@/lib/utils";
import { BackButton } from "@/components/nav/back-button";

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
        {back && <BackButton fallback={back} />}
        <h1 className="truncate text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
