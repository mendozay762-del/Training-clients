import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nav/page-header";
import { ExerciseBlock } from "@/components/workouts/exercise-block";
import { AddExerciseForm } from "@/components/workouts/add-exercise-form";
import { SessionNotesForm } from "@/components/workouts/session-notes-form";
import { DeleteWorkoutButton } from "@/components/workouts/delete-workout-button";
import { WorkoutDateForm } from "@/components/workouts/workout-date-form";
import { AddToProgramButton } from "@/components/workouts/add-to-program-button";
import { getWorkoutDetail, listBlocks } from "@/lib/queries/clients";

export const dynamic = "force-dynamic";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string; workoutId: string }>;
}) {
  const { id, workoutId } = await params;
  const data = await getWorkoutDetail(workoutId);
  if (!data || data.workout.clientId !== id) notFound();

  const { workout, exercises, inProgram } = data;
  // Only manually-logged sessions (not started from the program) can be added.
  const programs = inProgram ? [] : await listBlocks(id);

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

        {!inProgram && programs.length > 0 && (
          <AddToProgramButton
            workoutId={workoutId}
            clientId={id}
            programs={programs.map((p) => ({ id: p.id, name: p.name }))}
          />
        )}

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
                notes: s.notes,
                isWarmup: s.isWarmup,
                suggestedReps: s.suggestedReps,
                suggestedRir: s.suggestedRir,
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
