"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">This page hit an error.</h1>
      <p className="max-w-md text-sm text-text-secondary">
        Something went wrong loading this view. The rest of the app should
        still work — try again, or go back to the client list.
      </p>
      {error.digest && (
        <p className="text-xs text-text-tertiary">Reference: {error.digest}</p>
      )}
      <div className="mt-2 flex gap-2">
        <button
          onClick={reset}
          className="rounded-btn bg-card-hover/40 px-4 py-2 text-sm font-medium hover:bg-card-hover"
        >
          Try again
        </button>
        <Link
          href="/clients"
          className="rounded-btn bg-accent-blue px-4 py-2 text-sm font-semibold text-white hover:bg-accent-blue/90"
        >
          Back to clients
        </Link>
      </div>
    </div>
  );
}
