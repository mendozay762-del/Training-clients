import { Skeleton } from "@/components/skeleton";

export default function ClientDetailLoading() {
  return (
    <>
      <header className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-9 w-48 rounded-md" />
        </div>
        <Skeleton className="h-11 w-11 rounded-full" />
      </header>
      <div className="flex flex-col gap-3 p-4 pt-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-20" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </>
  );
}
