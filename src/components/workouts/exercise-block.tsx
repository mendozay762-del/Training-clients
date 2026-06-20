"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { SetRow } from "./set-row";
import { AddSetButton } from "./add-set-button";
import { deleteExercise } from "@/lib/actions/workouts";

interface Props {
  exercise: {
    id: string;
    exerciseName: string;
    sets: Array<{
      id: string;
      setIndex: number;
      reps: number;
      weightLbs: string | null;
      rpe: string | null;
      rir: number | null;
      notes: string | null;
      isWarmup: boolean;
      suggestedReps: string | null;
      suggestedRir: string | null;
    }>;
  };
  workoutId: string;
  clientId: string;
}

export function ExerciseBlock({ exercise, workoutId, clientId }: Props) {
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    if (
      !confirm(
        `Delete "${exercise.exerciseName}" and all its sets? This can't be undone.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deleteExercise(exercise.id, workoutId, clientId);
    });
  }

  const lastSet = exercise.sets[exercise.sets.length - 1] ?? null;
  const prefill = lastSet
    ? {
        reps: lastSet.reps,
        weightLbs: lastSet.weightLbs,
        rpe: lastSet.rpe,
        rir: lastSet.rir,
        isWarmup: lastSet.isWarmup,
      }
    : null;

  return (
    <section className="flex flex-col gap-2 rounded-card bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-text-primary">
          {exercise.exerciseName}
        </h3>
        <button
          type="button"
          onClick={onDelete}
          disabled={isPending}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-tertiary hover:bg-card-hover hover:text-accent-red disabled:opacity-50"
          aria-label={`Delete ${exercise.exerciseName}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {exercise.sets.length === 0 ? (
          <p className="px-1 py-2 text-xs text-text-tertiary">No sets yet.</p>
        ) : (
          exercise.sets.map((s) => (
            <SetRow
              key={s.id}
              id={s.id}
              setIndex={s.setIndex}
              initial={{
                reps: s.reps,
                weightLbs: s.weightLbs,
                rpe: s.rpe,
                rir: s.rir,
                notes: s.notes,
                isWarmup: s.isWarmup,
              }}
              suggestedReps={s.suggestedReps}
              suggestedRir={s.suggestedRir}
            />
          ))
        )}
      </div>

      <AddSetButton exerciseId={exercise.id} prefill={prefill} />
    </section>
  );
}
