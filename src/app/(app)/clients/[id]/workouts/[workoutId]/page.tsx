import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nav/page-header";
import { ExerciseBlock } from "@/components/workouts/exercise-block";
import { AddExerciseForm } from "@/components/workouts/add-exercise-form";
import { SessionNotesForm } from "@/components/workouts/session-notes-form";
import { DeleteWorkoutButton } from "@/components/workouts/delete-workout-button";
import { WorkoutDateForm } from "@/components/workouts/workout-date-form";
import { getWorkoutDetail } from "@/lib/queries/clients";

export const dynamic = "force-dynamic";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string; workoutId: string }>;
}) {
  const { id, workoutId } = await params;
  const data = await getWorkoutDetail(workoutId);
  if (!data || data.workout.clientId !== id) notFound();

  const { workout, exercises } = data;

  return (
    <>
      <PageHeader
        title="Session"
        back={`/clients/${id}`}
        actions={<DeleteWorkoutButton workoutId={workoutId} clientId={id} />}
      />

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2 rounded-card bg-card p-3">
          <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            Date
          </span>
          <WorkoutDateForm
            workoutId={workoutId}
            performedOn={String(workout.performedOn)}
          />
        </div>

        {exercises.map((ex) => (
          <ExerciseBlock
            key={ex.id}
            exercise={{
              id: ex.id,
              exerciseName: ex.exerciseName,
              sets: ex.sets.map((s) => ({
                id: s.id,
                setIndex: s.setIndex,
                reps: s.reps,
                weightLbs: s.weightLbs,
                rpe: s.rpe,
                rir: s.rir,
                isWarmup: s.isWarmup,
              })),
            }}
            workoutId={workoutId}
            clientId={id}
          />
        ))}

        <AddExerciseForm workoutId={workoutId} />

        <SessionNotesForm
          workoutId={workoutId}
          initialNotes={workout.notes}
        />
      </div>
    </>
  );
}
