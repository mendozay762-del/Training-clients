"use client";

import { useTransition } from "react";
import { Plus } from "lucide-react";
import { addSet } from "@/lib/actions/workouts";

interface Props {
  exerciseId: string;
  prefill: {
    reps: number;
    weightLbs: string | null;
    rpe: string | null;
    rir: number | null;
    isWarmup: boolean;
  } | null;
}

export function AddSetButton({ exerciseId, prefill }: Props) {
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("exerciseId", exerciseId);
      fd.set("reps", prefill ? String(prefill.reps) : "0");
      fd.set("weightLbs", prefill?.weightLbs ?? "");
      fd.set("rpe", prefill?.rpe ?? "");
      fd.set("rir", prefill?.rir !== null && prefill?.rir !== undefined ? String(prefill.rir) : "");
      // New sets default to working sets even if last was a warm-up.
      fd.set("isWarmup", "false");
      await addSet(fd);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="flex h-11 items-center justify-center gap-1.5 rounded-btn border border-dashed border-border-subtle/60 text-sm font-medium text-text-secondary hover:bg-card-hover hover:text-text-primary disabled:opacity-50"
    >
      <Plus className="h-4 w-4" />
      {isPending ? "Adding…" : "Add set"}
    </button>
  );
}
