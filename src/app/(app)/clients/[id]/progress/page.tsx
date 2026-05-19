import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nav/page-header";
import { PrTable } from "@/components/progress/pr-table";
import { E1rmChart } from "@/components/progress/e1rm-chart";
import { WorkoutsPerWeekChart } from "@/components/progress/workouts-per-week-chart";
import { BodyMetricChart } from "@/components/progress/body-metric-chart";
import { GoalProgress } from "@/components/progress/goal-progress";
import {
  getClient,
  listBodyStats,
  listClientPRs,
  listE1rmSeries,
  listGoals,
  listWorkoutsPerWeek,
} from "@/lib/queries/clients";

export const dynamic = "force-dynamic";

export default async function ClientProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [client, prs, e1rmSeries, perWeek, bodyStats, goals] = await Promise.all([
    getClient(id),
    listClientPRs(id),
    listE1rmSeries(id),
    listWorkoutsPerWeek(id),
    listBodyStats(id),
    listGoals(id),
  ]);
  if (!client) notFound();

  const weightSeries = [...bodyStats]
    .reverse()
    .filter((s) => s.weightLbs !== null)
    .map((s) => ({ weekStart: s.weekStart, value: Number(s.weightLbs) }));

  const waistSeries = [...bodyStats]
    .reverse()
    .filter((s) => s.waistIn !== null)
    .map((s) => ({ weekStart: s.weekStart, value: Number(s.waistIn) }));

  return (
    <>
      <PageHeader title="Progress" back={`/clients/${id}`} />

      <div className="flex flex-col gap-4 p-4">
        <PrTable prs={prs} />

        <E1rmChart data={e1rmSeries} />

        <WorkoutsPerWeekChart data={perWeek} />

        <BodyMetricChart label="Weight" unit="lb" data={weightSeries} />

        {waistSeries.length >= 2 && (
          <BodyMetricChart label="Waist" unit="in" data={waistSeries} />
        )}

        <GoalProgress goals={goals} />
      </div>
    </>
  );
}
