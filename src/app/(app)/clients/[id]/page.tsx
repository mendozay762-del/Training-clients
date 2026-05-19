import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList, Pencil } from "lucide-react";
import { PageHeader } from "@/components/nav/page-header";
import { HeroCard } from "@/components/clients/hero-card";
import { SectionBlock } from "@/components/clients/section-block";
import { WaiverBadge } from "@/components/clients/waiver-badge";
import { getClientDetail } from "@/lib/queries/clients";
import { relativeDays } from "@/lib/utils";
import { GoalToggleRow } from "@/components/goals/goal-toggle-row";

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

function fmtWeightDelta(
  current: string | number | null,
  prev: string | number | null,
): string | null {
  if (current === null || prev === null) return null;
  const c = Number(current);
  const p = Number(prev);
  if (Number.isNaN(c) || Number.isNaN(p)) return null;
  const diff = c - p;
  if (Math.abs(diff) < 0.05) return "No change from last week";
  const arrow = diff < 0 ? "↓" : "↑";
  return `${arrow} ${Math.abs(diff).toFixed(1)} lb from last week`;
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getClientDetail(id);
  if (!data) notFound();

  const {
    client,
    latestStats,
    prevStats,
    goals,
    upcomingSessions,
    latestNutrition,
    recentWorkouts,
    recentMessages,
    openActionCount,
    waiver,
  } = data;

  const nextSession = upcomingSessions[0];
  const weightDelta =
    latestStats && prevStats
      ? fmtWeightDelta(latestStats.weightLbs, prevStats.weightLbs)
      : null;

  return (
    <>
      <PageHeader
        title={client.name}
        back="/clients"
        actions={
          <>
            <Link
              href={`/clients/${id}/intake/edit`}
              aria-label="Edit intake questionnaire"
              title="Edit intake questionnaire"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-border-subtle/60 hover:bg-card-hover"
            >
              <ClipboardList className="h-4 w-4" />
            </Link>
            <Link
              href={`/clients/${id}/edit`}
              aria-label="Edit client"
              title="Edit basic info"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-border-subtle/60 hover:bg-card-hover"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          </>
        }
      />

      <div className="flex flex-col gap-3 p-4 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <WaiverBadge
            acceptedAt={waiver.acceptedAt}
            intakeHref={`/clients/${id}/intake/edit`}
          />
        </div>

        {nextSession ? (
          <HeroCard
            label="Next Session"
            title={formatSessionTime(new Date(nextSession.startsAt))}
            meta={nextSession.location ?? undefined}
          />
        ) : (
          <div className="rounded-card bg-card p-4 text-sm text-text-secondary">
            No upcoming session.
            <Link
              href={`/clients/${id}/sessions/new`}
              className="ml-1 font-medium text-accent-blue hover:underline"
            >
              Schedule one →
            </Link>
          </div>
        )}

        <section className="rounded-card bg-card p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            This week&apos;s check-in
          </div>
          {latestStats ? (
            <>
              <div className="mt-1.5 text-base font-semibold tabnums">
                {latestStats.weightLbs ? `${latestStats.weightLbs} lb` : "—"}
                {latestStats.sleepHoursAvg && (
                  <span className="font-normal text-text-secondary">
                    {" "}
                    · {latestStats.sleepHoursAvg}h sleep
                  </span>
                )}
                {latestStats.wellness !== null && (
                  <span className="font-normal text-text-secondary">
                    {" "}
                    · {latestStats.wellness}/10 wellness
                  </span>
                )}
              </div>
              {weightDelta && (
                <div className="mt-0.5 text-xs text-text-tertiary tabnums">
                  {weightDelta}
                </div>
              )}
              <Link
                href={`/clients/${id}/stats`}
                className="mt-3 inline-block text-sm font-medium text-accent-blue hover:underline"
              >
                Log this week →
              </Link>
            </>
          ) : (
            <Link
              href={`/clients/${id}/stats`}
              className="mt-2 block text-sm text-accent-blue hover:underline"
            >
              Log this week&apos;s stats →
            </Link>
          )}
        </section>

        <SectionBlock
          label="Workouts"
          addHref={`/clients/${id}/workouts/new`}
          viewHref={`/clients/${id}/workouts`}
          count={recentWorkouts.length}
          empty="No workouts logged yet."
        >
          {recentWorkouts.length > 0 &&
            recentWorkouts.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium">
                  {new Date(w.performedOn).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-text-tertiary">
                  {relativeDays(w.performedOn)}
                </span>
              </div>
            ))}
        </SectionBlock>

        <SectionBlock
          label="Goals"
          addHref={`/clients/${id}/goals`}
          viewHref={`/clients/${id}/goals`}
          count={goals.length}
          empty="No goals yet."
        >
          {goals.length > 0 &&
            goals.map((g) => (
              <GoalToggleRow
                key={g.id}
                id={g.id}
                clientId={id}
                body={g.body}
                done={g.done}
              />
            ))}
        </SectionBlock>

        <SectionBlock
          label="Sessions"
          addHref={`/clients/${id}/sessions/new`}
          viewHref={`/clients/${id}/sessions`}
          count={upcomingSessions.length}
          empty="No upcoming sessions."
        >
          {upcomingSessions.length > 0 &&
            upcomingSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium">
                  {formatSessionTime(new Date(s.startsAt))}
                </span>
                {s.location && (
                  <span className="text-text-tertiary">{s.location}</span>
                )}
              </div>
            ))}
        </SectionBlock>

        <SectionBlock
          label="Nutrition"
          addHref={`/clients/${id}/nutrition`}
          viewHref={`/clients/${id}/nutrition`}
          count={latestNutrition.length}
          empty="No notes yet."
        >
          {latestNutrition.length > 0 &&
            latestNutrition.map((n) => (
              <div key={n.id} className="text-sm">
                <span className="font-medium tabnums">
                  {new Date(n.noteDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                  :
                </span>{" "}
                <span className="text-text-secondary">
                  {n.bodyMd.length > 60
                    ? `${n.bodyMd.slice(0, 60)}…`
                    : n.bodyMd}
                </span>
              </div>
            ))}
        </SectionBlock>

        <SectionBlock
          label={
            openActionCount > 0
              ? `Messages · ${openActionCount} open`
              : "Messages"
          }
          addHref={`/clients/${id}/messages`}
          viewHref={`/clients/${id}/messages`}
          count={recentMessages.length}
          empty="No messages logged yet."
        >
          {recentMessages.length > 0 &&
            recentMessages.map((m) => (
              <div key={m.id} className="text-sm">
                <span className="font-medium tabnums">
                  {new Date(m.occurredAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                  :
                </span>{" "}
                <span className="text-text-secondary">
                  {m.body.length > 60 ? `${m.body.slice(0, 60)}…` : m.body}
                </span>
              </div>
            ))}
        </SectionBlock>
      </div>
    </>
  );
}
