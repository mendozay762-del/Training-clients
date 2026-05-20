"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface Props {
  fallback: string;
  className?: string;
  label?: string;
}

export function BackButton({ fallback, className, label = "Back" }: Props) {
  const router = useRouter();

  function onClick() {
    // Prefer true browser-back so the user returns to the exact page they
    // came from. Fall back to the hierarchical parent on a cold load
    // (deep link, refresh, or PWA launch) where there's no in-app history.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={
        className ??
        "-ml-2 flex h-11 w-11 items-center justify-center rounded-full bg-card-hover/40 text-text-secondary hover:text-text-primary hover:bg-card-hover"
      }
    >
      <ChevronLeft className="h-6 w-6" />
    </button>
  );
}
