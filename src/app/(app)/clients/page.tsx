import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/nav/page-header";
import { ClientListCard } from "@/components/clients/client-list-card";
import { HeroCard } from "@/components/clients/hero-card";
import { InstallBanner } from "@/components/install-banner";
import {
  listClients,
  getNextSessionAcrossClients,
  getWeekSummary,
} from "@/lib/queries/clients";
import { relativeDays } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatSessionTime(d: Date): string {
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  if (sameDay) return `Today ${time}`;
  if (isTomorrow) return `Tomorrow ${time}`;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function clientSubtitle(c: {
  lastWorkoutOn: string | null;
  nextSessionAt: Date | string | null;
}): string {
  const parts: string[] = [];
  parts.push(
    c.lastWorkoutOn
      ? `Last workout ${relativeDays(c.lastWorkoutOn)}`
      : "No workouts yet",
  );
  if (c.nextSessionAt) {
    const d = typeof c.nextSessionAt === "string"
      ? new Date(c.nextSessionAt)
      : c.nextSessionAt;
    parts.push(`Next ${formatSessionTime(d).toLowerCase()}`);
  } else {
    parts.push("No session yet");
  }
  return parts.join(" · ");
}

export default async function ClientsPage() {
  const [clients, nextSession, week] = await Promise.all([
    listClients(),
    getNextSessionAcrossClients(),
    getWeekSummary(),
  ]);

  return (
    <>
      <PageHeader
        title="Clients"
        actions={
          <Link
            href="/clients/new"
            aria-label="Add client"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-border-subtle/60 hover:bg-card-hover"
          >
            <Plus className="h-5 w-5" />
          </Link>
        }
      />

      <InstallBanner />

      <div className="flex flex-col gap-3 p-4 pt-3">
        {nextSession && (
          <HeroCard
            label="Next Session"
            title={`${nextSession.clientName} · ${formatSessionTime(new Date(nextSession.startsAt))}`}
            meta={nextSession.location ?? undefined}
            actionLabel="View"
            href={`/clients/${nextSession.clientId}`}
          />
        )}

        <div className="flex items-center gap-2 px-1 py-2 text-sm text-text-secondary">
          <span className="tabnums">
            {week.loggedThisWeek} of {week.totalClients} logged this week
          </span>
        </div>

        {clients.length === 0 ? (
          <div className="rounded-card bg-card p-8 text-center">
            <p className="text-text-secondary">No clients yet.</p>
            <Link
              href="/clients/new"
              className="mt-3 inline-block text-sm font-medium text-accent-blue hover:underline"
            >
              Add your first client →
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {clients.map((c) => (
              <li key={c.id}>
                <ClientListCard
                  id={c.id}
                  name={c.name}
                  subtitle={clientSubtitle({
                    lastWorkoutOn: c.lastWorkoutOn,
                    nextSessionAt: c.nextSessionAt,
                  })}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
