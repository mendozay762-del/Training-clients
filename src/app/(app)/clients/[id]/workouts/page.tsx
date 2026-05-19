import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/nav/page-header";
import { getClient, listWorkouts } from "@/lib/queries/clients";
import { relativeDays } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientWorkoutsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, list] = await Promise.all([getClient(id), listWorkouts(id)]);
  if (!client) notFound();

  return (
    <>
      <PageHeader
        title="Workouts"
        back={`/clients/${id}`}
        actions={
          <Link
            href={`/clients/${id}/workouts/new`}
            aria-label="Start new workout"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-border-subtle/60 hover:bg-card-hover"
          >
            <Plus className="h-5 w-5" />
          </Link>
        }
      />

      <div className="flex flex-col gap-3 p-4">
        {list.length === 0 ? (
          <div className="rounded-card bg-card p-8 text-center">
            <p className="text-text-secondary">No workouts logged yet.</p>
            <Link
              href={`/clients/${id}/workouts/new`}
              className="mt-3 inline-block text-sm font-medium text-accent-blue hover:underline"
            >
              Start the first one →
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {list.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/clients/${id}/workouts/${w.id}`}
                  className="flex items-center justify-between gap-3 rounded-card bg-card p-4 hover:bg-card-hover"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-text-primary tabnums">
                      {new Date(w.performedOn).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {w.exerciseCount === 0
                        ? "No exercises logged"
                        : `${w.exerciseCount} exercise${w.exerciseCount === 1 ? "" : "s"} · ${w.setCount} set${w.setCount === 1 ? "" : "s"}`}
                      {" · "}
                      <span className="text-text-tertiary">
                        {relativeDays(w.performedOn)}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
