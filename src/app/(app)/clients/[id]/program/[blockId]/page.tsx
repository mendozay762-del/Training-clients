import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { PageHeader } from "@/components/nav/page-header";
import { SheetImportForm } from "@/components/program/sheet-import-form";
import { WeekActions } from "@/components/program/week-actions";
import { getBlockDetail } from "@/lib/queries/clients";
import {
  BLOCK_STYLE_LABELS,
  type BlockStyle,
} from "@/lib/schemas/prescriptions";

export const dynamic = "force-dynamic";

function statusPill(status: string) {
  const styles: Record<string, string> = {
    planned: "bg-card-hover text-text-secondary",
    completed: "bg-accent-green/15 text-accent-green",
    skipped: "bg-accent-amber/15 text-accent-amber",
  };
  return (
    <span
      className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${styles[status] ?? styles.planned}`}
    >
      {status}
    </span>
  );
}

function formatLongDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function groupByWeek<T extends { prescribedFor: string }>(
  items: T[],
  startDate: string | null,
): { weekLabel: string; items: T[] }[] {
  if (items.length === 0) return [];
  const baseDate = startDate
    ? new Date(startDate)
    : new Date(items[0].prescribedFor);
  const baseMs = new Date(
    Date.UTC(
      baseDate.getUTCFullYear(),
      baseDate.getUTCMonth(),
      baseDate.getUTCDate(),
    ),
  ).getTime();

  const byWeek = new Map<number, T[]>();
  for (const item of items) {
    const d = new Date(item.prescribedFor);
    const itemMs = Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
    );
    const days = Math.floor((itemMs - baseMs) / (1000 * 60 * 60 * 24));
    const week = Math.floor(days / 7) + 1;
    const arr = byWeek.get(week) ?? [];
    arr.push(item);
    byWeek.set(week, arr);
  }

  return Array.from(byWeek.entries())
    .sort(([a], [b]) => a - b)
    .map(([week, items]) => ({
      weekLabel: week < 1 ? `Pre-week ${1 - week}` : `Week ${week}`,
      items,
    }));
}

// Group days into mesocycles (ordered by their first date), and number the
// weeks WITHIN each mesocycle from its own start — so a mesocycle can be any
// length (4–6 weeks) and its weeks always read Week 1, Week 2, …
function groupByMesocycle<
  T extends { prescribedFor: string; mesocycle: string | null },
>(items: T[]): { name: string; weeks: { weekLabel: string; items: T[] }[] }[] {
  const byMeso = new Map<string, T[]>();
  for (const it of items) {
    const key = it.mesocycle ?? "Mesocycle 1";
    const arr = byMeso.get(key) ?? [];
    arr.push(it);
    byMeso.set(key, arr);
  }

  return Array.from(byMeso.entries())
    .map(([name, list]) => {
      const start = list.reduce(
        (min, it) => (it.prescribedFor < min ? it.prescribedFor : min),
        list[0].prescribedFor,
      );
      return { name, start, weeks: groupByWeek(list, start) };
    })
    .sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0))
    .map(({ name, weeks }) => ({ name, weeks }));
}

export default async function BlockDetailPage({
  params,
}: {
  params: Promise<{ id: string; blockId: string }>;
}) {
  const { id, blockId } = await params;
  const detail = await getBlockDetail(blockId);
  if (!detail || detail.block.clientId !== id) notFound();

  const { block, prescribed } = detail;
  const mesocycles = groupByMesocycle(prescribed);

  // Flat, chronological list of week-groups across all mesocycles, so the
  // delete tools can compute "this week" and "from here onward" precisely.
  const flatWeeks = mesocycles.flatMap((m) =>
    m.weeks.map((w) => ({ meso: m.name, week: w })),
  );

  // Un-logged (deletable) day ids per week, and cumulatively from each week
  // onward. Days with a logged session (actualWorkoutId set) are never listed,
  // so the delete tools can't touch training history.
  const weekDeletableIds = flatWeeks.map((f) =>
    f.week.items.filter((it) => it.actualWorkoutId === null).map((it) => it.id),
  );
  const fromHereIds = weekDeletableIds.map((_, i) =>
    weekDeletableIds.slice(i).flat(),
  );

  // Pre-fill the import form with the next mesocycle name.
  const suggestedMesocycle = `Mesocycle ${mesocycles.length + 1}`;

  return (
    <>
      <PageHeader
        title={block.name}
        back={`/clients/${id}`}
        actions={
          <Link
            href={`/clients/${id}/program/${blockId}/edit`}
            aria-label="Edit block"
            title="Edit block"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-border-subtle/60 hover:bg-card-hover"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        }
      />

      <div className="flex flex-col gap-4 p-4">
        <section className="rounded-card bg-card p-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-text-tertiary">
            {block.style && (
              <span>
                {BLOCK_STYLE_LABELS[block.style as BlockStyle] ?? block.style}
              </span>
            )}
            {block.startDate && (
              <span>
                Starts{" "}
                {new Date(block.startDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            {block.endDate && (
              <span>
                Ends{" "}
                {new Date(block.endDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            <span>
              Status:{" "}
              <span className="text-text-secondary">{block.status}</span>
            </span>
          </div>
          {block.weeklySplitSummary && (
            <p className="mt-2 text-sm text-text-secondary">
              {block.weeklySplitSummary}
            </p>
          )}
          {block.notes && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">
              {block.notes}
            </p>
          )}
        </section>

        <section className="rounded-card bg-card p-4">
          <SheetImportForm
            blockId={blockId}
            suggestedMesocycle={suggestedMesocycle}
          />
        </section>

        {flatWeeks.length === 0 ? (
          <div className="rounded-card bg-card p-6 text-center text-sm text-text-tertiary">
            No prescribed workouts yet — paste your sheet above to populate
            the block.
          </div>
        ) : (
          flatWeeks.map((f, i) => (
            <Fragment key={`${f.meso}::${f.week.weekLabel}`}>
              {(i === 0 || flatWeeks[i - 1].meso !== f.meso) && (
                <div className="px-1 pb-1 pt-2">
                  <h2 className="text-sm font-semibold text-text-primary">
                    {f.meso}
                  </h2>
                </div>
              )}
              <section className="rounded-card bg-card p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {f.week.weekLabel}
                  </h3>
                  <WeekActions
                    clientId={id}
                    blockId={blockId}
                    weekLabel={`${f.meso} · ${f.week.weekLabel}`}
                    weekIds={weekDeletableIds[i]}
                    fromHereIds={fromHereIds[i]}
                  />
                </div>
                <ul className="flex flex-col divide-y divide-white/[0.04]">
                  {f.week.items.map((pw) => (
                    <li key={pw.id}>
                      <Link
                        href={`/clients/${id}/program/${blockId}/prescribed/${pw.id}`}
                        className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2.5 hover:bg-card-hover"
                      >
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2 text-sm">
                            <span className="font-medium">
                              {formatLongDate(pw.prescribedFor)}
                            </span>
                            {pw.name && (
                              <span className="truncate text-text-secondary">
                                · {pw.name}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-text-tertiary">
                            {pw.exerciseCount} exercise
                            {pw.exerciseCount === 1 ? "" : "s"}
                          </div>
                        </div>
                        {statusPill(pw.status)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </Fragment>
          ))
        )}
      </div>
    </>
  );
}
