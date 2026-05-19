import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ClientInitialsAvatar } from "./client-initials-avatar";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  name: string;
  subtitle?: string;
  openActionCount?: number;
  href?: string;
  className?: string;
}

export function ClientListCard({
  id,
  name,
  subtitle,
  openActionCount,
  href,
  className,
}: Props) {
  const target = href ?? `/clients/${id}`;
  return (
    <Link
      href={target}
      className={cn(
        "group flex items-center gap-3 rounded-card bg-card p-4 transition-colors hover:bg-card-hover active:scale-[0.99]",
        className,
      )}
    >
      <ClientInitialsAvatar id={id} name={name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-base font-semibold text-text-primary">
            {name}
          </span>
          {openActionCount !== undefined && openActionCount > 0 && (
            <span
              className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-amber px-1.5 text-[11px] font-semibold text-base"
              aria-label={`${openActionCount} open action items`}
              title={`${openActionCount} open action items`}
            >
              {openActionCount}
            </span>
          )}
        </div>
        {subtitle && (
          <div className="truncate text-sm text-text-secondary">{subtitle}</div>
        )}
      </div>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-text-tertiary transition-colors group-hover:text-text-secondary"
        aria-hidden
      />
    </Link>
  );
}
