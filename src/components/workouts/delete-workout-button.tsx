"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteWorkout } from "@/lib/actions/workouts";

interface Props {
  workoutId: string;
  clientId: string;
}

export function DeleteWorkoutButton({ workoutId, clientId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onClick() {
    if (
      !confirm("Delete this workout and all its sets? This can't be undone.")
    ) {
      return;
    }
    startTransition(async () => {
      await deleteWorkout(workoutId, clientId);
      router.replace(`/clients/${clientId}/workouts`);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-border-subtle/60 text-text-tertiary hover:bg-card-hover hover:text-accent-red disabled:opacity-50"
      aria-label="Delete workout"
      title="Delete workout"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
