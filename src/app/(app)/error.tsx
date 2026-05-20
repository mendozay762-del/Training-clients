"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AppRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/clients");
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">This page hit an error.</h1>
      <p className="max-w-md text-sm text-text-secondary">
        Something went wrong loading this view. The rest of the app still
        works — go back to the previous page, try again, or jump to the
        client list.
      </p>
      {error.digest && (
        <p className="text-xs text-text-tertiary">Reference: {error.digest}</p>
      )}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={goBack}
          className="rounded-btn bg-accent-blue px-4 py-2 text-sm font-semibold text-white hover:bg-accent-blue/90"
        >
          Go back
        </button>
        <button
          onClick={reset}
          className="rounded-btn bg-card-hover/40 px-4 py-2 text-sm font-medium hover:bg-card-hover"
        >
          Try again
        </button>
        <Link
          href="/clients"
          className="rounded-btn bg-card-hover/40 px-4 py-2 text-sm font-medium hover:bg-card-hover"
        >
          Client list
        </Link>
      </div>
    </div>
  );
}
