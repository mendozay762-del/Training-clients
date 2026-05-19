import { Skeleton } from "@/components/skeleton";

export default function ClientsLoading() {
  return (
    <>
      <header className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-11 w-11 rounded-full" />
      </header>
      <div className="flex flex-col gap-3 p-4 pt-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-5 w-48 rounded-md" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </>
  );
}
