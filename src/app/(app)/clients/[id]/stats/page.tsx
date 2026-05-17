import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nav/page-header";
import { BodyStatsForm } from "@/components/stats/body-stats-form";
import { WeightChart } from "@/components/stats/weight-chart";
import { getClient, listBodyStats } from "@/lib/queries/clients";
import { currentWeekStart } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientStatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, stats] = await Promise.all([
    getClient(id),
    listBodyStats(id),
  ]);
  if (!client) notFound();

  const currentWeek = currentWeekStart();
  const thisWeekRow = stats.find((s) => s.weekStart === currentWeek) ?? null;

  const chartData = [...stats]
    .reverse()
    .filter((s) => s.weightLbs !== null)
    .map((s) => ({
      weekStart: s.weekStart,
      weightLbs: Number(s.weightLbs),
    }));

  return (
    <>
      <PageHeader title="Body stats" back={`/clients/${id}`} />

      <div className="flex flex-col gap-4 p-4">
        <section className="rounded-card bg-card p-4">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
            {thisWeekRow ? "Update this week" : "Log this week"}
          </div>
          <BodyStatsForm clientId={id} initial={thisWeekRow} />
        </section>

        <WeightChart data={chartData} />

        {stats.length > 0 && (
          <section className="rounded-card bg-card p-4">
            <div className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
              History
            </div>
            <ul className="flex flex-col divide-y divide-white/[0.04]">
              {stats.map((s) => (
                <li
                  key={s.id}
                  className="flex items-baseline justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="font-medium tabnums">
                    {new Date(s.weekStart).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-text-secondary tabnums">
                    {s.weightLbs ? `${s.weightLbs} lb` : "—"}
                    {s.sleepHoursAvg && ` · ${s.sleepHoursAvg}h`}
                    {s.wellness !== null && ` · ${s.wellness}/10`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
