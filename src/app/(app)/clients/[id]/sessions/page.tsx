import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/nav/page-header";
import { getClient, listSessions } from "@/lib/queries/clients";
import { SESSION_STATUS_LABELS, type SessionStatus } from "@/lib/schemas/session";

export const dynamic = "force-dynamic";

function statusPill(status: string) {
  const styles: Record<string, string> = {
    scheduled: "bg-accent-blue/15 text-accent-blue",
    completed: "bg-accent-green/15 text-accent-green",
    cancelled: "bg-card-hover/40 text-text-tertiary line-through",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${styles[status] ?? styles.scheduled}`}
    >
      {SESSION_STATUS_LABELS[status as SessionStatus] ?? status}
    </span>
  );
}

function formatWhen(d: Date): string {
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function SessionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, allSessions] = await Promise.all([
    getClient(id),
    listSessions(id),
  ]);
  if (!client) notFound();

  const now = Date.now();
  const upcoming = allSessions
    .filter(
      (s) => s.status === "scheduled" && new Date(s.startsAt).getTime() >= now,
    )
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
  const upcomingIds = new Set(upcoming.map((s) => s.id));
  const past = allSessions.filter((s) => !upcomingIds.has(s.id));

  function row(s: (typeof allSessions)[number]) {
    return (
      <li key={s.id}>
        <Link
          href={`/clients/${id}/sessions/${s.id}/edit`}
          className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2.5 hover:bg-card-hover"
        >
          <div className="min-w-0">
            <div className="text-sm font-medium tabnums">
              {formatWhen(new Date(s.startsAt))}
            </div>
            <div className="text-xs text-text-tertiary">
              {s.durationMin} min
              {s.location ? ` · ${s.location}` : ""}
            </div>
          </div>
          {statusPill(s.status)}
        </Link>
      </li>
    );
  }

  return (
    <>
      <PageHeader
        title="Sessions"
        back={`/clients/${id}`}
        actions={
          <Link
            href={`/clients/${id}/sessions/new`}
            aria-label="Schedule session"
            title="Schedule session"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-border-subtle/60 hover:bg-card-hover"
          >
            <Plus className="h-4 w-4" />
          </Link>
        }
      />

      <div className="flex flex-col gap-4 p-4">
        {allSessions.length === 0 ? (
          <div className="rounded-card bg-card p-6 text-center">
            <p className="text-sm text-text-secondary">
              No sessions scheduled yet.
            </p>
            <Link
              href={`/clients/${id}/sessions/new`}
              className="mt-3 inline-block text-sm font-medium text-accent-blue hover:underline"
            >
              Schedule the first one →
            </Link>
          </div>
        ) : (
          <>
            <section className="rounded-card bg-card p-4">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
                Upcoming{upcoming.length > 0 ? ` · ${upcoming.length}` : ""}
              </h3>
              {upcoming.length === 0 ? (
                <p className="text-sm text-text-tertiary">
                  Nothing on the calendar.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-white/[0.04]">
                  {upcoming.map(row)}
                </ul>
              )}
            </section>

            {past.length > 0 && (
              <section className="rounded-card bg-card p-4">
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
                  Past &amp; cancelled
                </h3>
                <ul className="flex flex-col divide-y divide-white/[0.04]">
                  {past.map(row)}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
