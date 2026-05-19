"use client";

import { useRef, useTransition } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { addExercise } from "@/lib/actions/workouts";

export function AddExerciseForm({ workoutId }: { workoutId: string }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(fd) =>
        startTransition(async () => {
          await addExercise(fd);
          formRef.current?.reset();
        })
      }
      className="flex items-center gap-2 rounded-card border border-dashed border-border-subtle/40 bg-card/40 p-3"
    >
      <input type="hidden" name="workoutId" value={workoutId} />
      <Input
        name="exerciseName"
        placeholder="Add exercise (e.g. Back squat)"
        required
        maxLength={80}
        className="flex-1"
      />
      <button
        type="submit"
        disabled={isPending}
        className="flex h-11 items-center justify-center gap-1.5 rounded-btn bg-accent-blue px-3 text-sm font-semibold text-base disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        {isPending ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
