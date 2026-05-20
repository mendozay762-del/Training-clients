"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { startSessionFromPrescription } from "@/lib/actions/prescriptions";

interface Props {
  clientId: string;
  prescribedId: string;
  blockId: string;
  name: string | null;
  status: string;
  exerciseCount: number;
  actualWorkoutId: string | null;
}

export function TodaysPlanCard({
  clientId,
  prescribedId,
  blockId,
  name,
  status,
  exerciseCount,
  actualWorkoutId,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const skipped = status === "skipped";
  const completed = status === "completed" && actualWorkoutId !== null;

  return (
    <section className="rounded-card bg-accent-blue/10 border border-accent-blue/30 p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-accent-blue">
        Today&apos;s plan
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold">
            {name ?? "Prescribed workout"}
          </div>
          <div className="text-xs text-text-secondary">
            {exerciseCount} exercise{exerciseCount === 1 ? "" : "s"} ·{" "}
            <span className="text-text-tertiary">{status}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {completed && actualWorkoutId ? (
          <Link
            href={`/clients/${clientId}/workouts/${actualWorkoutId}`}
            className="text-sm font-medium text-accent-blue hover:underline"
          >
            Open logged session →
          </Link>
        ) : skipped ? (
          <span className="text-sm text-text-secondary">Marked skipped.</span>
        ) : (
          <Button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await startSessionFromPrescription(prescribedId);
              })
            }
          >
            {isPending ? "Starting…" : "Start session"}
          </Button>
        )}
        <Link
          href={`/clients/${clientId}/program/${blockId}/prescribed/${prescribedId}`}
          className="text-sm font-medium text-accent-blue hover:underline"
        >
          View plan →
        </Link>
      </div>
    </section>
  );
}
