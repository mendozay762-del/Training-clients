import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nav/page-header";
import { PrescribedActions } from "@/components/program/prescribed-actions";
import { PrescribedWorkoutForm } from "@/components/program/prescribed-workout-form";
import { getPrescribedWorkoutDetail } from "@/lib/queries/clients";
import { formatRirRange } from "@/lib/prescription-format";

export const dynamic = "force-dynamic";

function formatReps(
  low: number | null,
  high: number | null,
  text: string | null,
): string {
  if (text) return text;
  if (low !== null && high !== null && low !== high) return `${low}–${high}`;
  if (low !== null) return String(low);
  return "—";
}

function formatLoad(
  lbs: string | null,
  pct: string | null,
  text: string | null,
): string {
  if (lbs !== null) return `${Number(lbs)} lb`;
  if (pct !== null) return `${Number(pct)}% 1RM`;
  if (text) return text;
  return "—";
}

export default async function PrescribedWorkoutPage({
  params,
}: {
  params: Promise<{ id: string; blockId: string; prescribedId: string }>;
}) {
  const { id, blockId, prescribedId } = await params;
  const detail = await getPrescribedWorkoutDetail(prescribedId);
  if (!detail || detail.workout.clientId !== id) notFound();

  const { workout, exercises } = detail;

  return (
    <>
      <PageHeader
        title={workout.name ?? "Prescribed workout"}
        back={`/clients/${id}`}
      />

      <div className="flex flex-col gap-4 p-4">
        <section className="rounded-card bg-card p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            Date · status
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-base font-semibold tabnums">
              {new Date(workout.prescribedFor).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-sm text-text-secondary">
              · {workout.status}
            </span>
          </div>
          {workout.skipReason && (
            <p className="mt-2 text-sm text-text-secondary">
              Skipped: {workout.skipReason}
            </p>
          )}
          {workout.notes && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">
              {workout.notes}
            </p>
          )}
        </section>

        <section className="rounded-card bg-card p-4">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
            Plan · {exercises.length} exercise
            {exercises.length === 1 ? "" : "s"}
          </h3>
          {exercises.length === 0 ? (
            <p className="text-sm text-text-tertiary">
              No exercises in this workout.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {exercises.map((ex) => (
                <li
                  key={ex.id}
                  className="rounded-md bg-card-hover/40 p-3"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{ex.exerciseName}</span>
                    <span className="text-sm tabnums">
                      {ex.sets ?? "—"} ×{" "}
                      {formatReps(ex.repsLow, ex.repsHigh, ex.repsText)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-xs text-text-tertiary tabnums">
                    <span>
                      Load: {formatLoad(ex.loadLbs, ex.loadPct1rm, ex.loadText)}
                    </span>
                    {ex.rpeTarget && <span>· RPE {Number(ex.rpeTarget)}</span>}
                    {(formatRirRange(ex.rirLow, ex.rirHigh) ??
                      (ex.rirTarget !== null ? String(ex.rirTarget) : null)) && (
                      <span>
                        · RIR{" "}
                        {formatRirRange(ex.rirLow, ex.rirHigh) ?? ex.rirTarget}
                      </span>
                    )}
                  </div>
                  {ex.notes && (
                    <p className="mt-1 text-xs text-text-secondary">
                      {ex.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-card bg-card p-4">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
            Actions
          </h3>
          {workout.actualWorkoutId ? (
            <Link
              href={`/clients/${id}/workouts/${workout.actualWorkoutId}`}
              className="inline-block text-sm font-medium text-accent-blue hover:underline"
            >
              View logged session →
            </Link>
          ) : null}
          <div className="mt-2">
            <PrescribedActions
              prescribedId={prescribedId}
              clientId={id}
              blockId={blockId}
              status={workout.status}
              hasActualWorkout={Boolean(workout.actualWorkoutId)}
            />
          </div>
        </section>

        <section className="rounded-card bg-card p-4">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
            Edit name · date · notes
          </h3>
          <PrescribedWorkoutForm
            prescribedId={prescribedId}
            clientId={id}
            blockId={blockId}
            initial={{
              name: workout.name,
              notes: workout.notes,
              prescribedFor: workout.prescribedFor,
            }}
          />
        </section>
      </div>
    </>
  );
}
