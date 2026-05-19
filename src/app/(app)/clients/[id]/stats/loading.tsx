import { Skeleton } from "@/components/skeleton";

export default function ClientStatsLoading() {
  return (
    <>
      <header className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>
      </header>
      <div className="flex flex-col gap-3 p-4 pt-3">
        <Skeleton className="h-44" />
        <Skeleton className="h-32" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </>
  );
}
