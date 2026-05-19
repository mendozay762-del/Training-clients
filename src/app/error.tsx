"use client";

import { useEffect } from "react";

export default function AppError({
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">Something went wrong.</h1>
      <p className="max-w-md text-sm text-text-secondary">{error.message}</p>
      {error.digest && (
        <p className="text-xs text-text-tertiary">Digest: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="mt-2 rounded-btn bg-card px-4 py-2 text-sm font-medium hover:bg-card-hover"
      >
        Try again
      </button>
    </div>
  );
}
