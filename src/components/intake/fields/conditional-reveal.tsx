"use client";

import { cn } from "@/lib/utils";

interface ConditionalRevealProps {
  when: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ConditionalReveal({
  when,
  children,
  className,
}: ConditionalRevealProps) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-200 ease-out",
        when ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        className,
      )}
      aria-hidden={!when}
    >
      <div className="overflow-hidden">
        <div className={cn("flex flex-col gap-4", when ? "pt-3" : "")}>
          {children}
        </div>
      </div>
    </div>
  );
}
