import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nav/page-header";
import { GoalForm } from "@/components/goals/goal-form";
import { GoalToggleRow } from "@/components/goals/goal-toggle-row";
import { DeleteGoalButton } from "@/components/goals/delete-goal-button";
import { getClient, listGoals } from "@/lib/queries/clients";

export const dynamic = "force-dynamic";

export default async function ClientGoalsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, allGoals] = await Promise.all([
    getClient(id),
    listGoals(id),
  ]);
  if (!client) notFound();

  const open = allGoals.filter((g) => !g.done);
  const done = allGoals.filter((g) => g.done);

  return (
    <>
      <PageHeader title="Goals" back={`/clients/${id}`} />

      <div className="flex flex-col gap-4 p-4">
        <section className="rounded-card bg-card p-4">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
            New goal
          </div>
          <GoalForm clientId={id} />
        </section>

        {open.length > 0 && (
          <section className="rounded-card bg-card p-4">
            <div className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
              Open ({open.length})
            </div>
            <ul className="flex flex-col gap-3">
              {open.map((g) => (
                <li key={g.id} className="flex items-start gap-2">
                  <div className="flex-1">
                    <GoalToggleRow
                      id={g.id}
                      clientId={id}
                      body={g.body}
                      done={g.done}
                    />
                    {g.targetDate && (
                      <div className="ml-7 mt-0.5 text-xs text-text-tertiary tabnums">
                        Target:{" "}
                        {new Date(g.targetDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    )}
                  </div>
                  <DeleteGoalButton id={g.id} clientId={id} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {done.length > 0 && (
          <section className="rounded-card bg-card p-4">
            <div className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
              Done ({done.length})
            </div>
            <ul className="flex flex-col gap-3">
              {done.map((g) => (
                <li key={g.id} className="flex items-start gap-2">
                  <div className="flex-1">
                    <GoalToggleRow
                      id={g.id}
                      clientId={id}
                      body={g.body}
                      done={g.done}
                    />
                  </div>
                  <DeleteGoalButton id={g.id} clientId={id} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {allGoals.length === 0 && (
          <p className="px-4 text-center text-sm text-text-tertiary">
            No goals yet.
          </p>
        )}
      </div>
    </>
  );
}
