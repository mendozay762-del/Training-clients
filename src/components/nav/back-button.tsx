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

  return (
    <button
      type="button"
      onClick={() => router.push(fallback)}
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
