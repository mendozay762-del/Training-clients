import { PageHeader } from "@/components/nav/page-header";
import { getWeekSummary } from "@/lib/queries/clients";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const week = await getWeekSummary();

  return (
    <>
      <PageHeader title="Stats" />
      <div className="flex flex-col gap-3 p-4">
        <section className="rounded-card bg-card p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            This week
          </div>
          <div className="mt-2 text-3xl font-bold tabnums">
            {week.loggedThisWeek} / {week.totalClients}
          </div>
          <div className="mt-1 text-sm text-text-secondary">
            clients logged a workout this week
          </div>
        </section>

        <div className="rounded-card bg-card p-8 text-center">
          <p className="text-text-secondary">
            Cross-client analytics arrive in milestone 2.
          </p>
        </div>
      </div>
    </>
  );
}
