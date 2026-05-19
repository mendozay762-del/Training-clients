import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-card bg-card-hover/30",
        className,
      )}
    />
  );
}
