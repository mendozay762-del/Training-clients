import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/nav/page-header";
import { getClient, listBlocks } from "@/lib/queries/clients";
import { BLOCK_STYLE_LABELS, type BlockStyle } from "@/lib/schemas/prescriptions";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    active: "bg-accent-green/15 text-accent-green",
    draft: "bg-card-hover text-text-secondary",
    completed: "bg-card-hover/40 text-text-tertiary",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${styles[status] ?? styles.draft}`}
    >
      {status}
    </span>
  );
}

function formatDateRange(start: string | null, end: string | null) {
  if (!start && !end) return null;
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  if (start && end) return `${fmt(start)} → ${fmt(end)}`;
  if (start) return `from ${fmt(start)}`;
  return `until ${fmt(end!)}`;
}

export default async function ProgramListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, blocks] = await Promise.all([
    getClient(id),
    listBlocks(id),
  ]);
  if (!client) notFound();

  return (
    <>
      <PageHeader
        title="Program"
        back={`/clients/${id}`}
        actions={
          <Link
            href={`/clients/${id}/program/new`}
            aria-label="New block"
            title="New block"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-border-subtle/60 hover:bg-card-hover"
          >
            <Plus className="h-4 w-4" />
          </Link>
        }
      />

      <div className="flex flex-col gap-3 p-4">
        {blocks.length === 0 ? (
          <div className="rounded-card bg-card p-6 text-center">
            <p className="text-sm text-text-secondary">
              No training blocks yet.
            </p>
            <Link
              href={`/clients/${id}/program/new`}
              className="mt-3 inline-block text-sm font-medium text-accent-blue hover:underline"
            >
              Create the first block →
            </Link>
          </div>
        ) : (
          blocks.map((b) => {
            const range = formatDateRange(b.startDate, b.endDate);
            return (
              <Link
                key={b.id}
                href={`/clients/${id}/program/${b.id}`}
                className="rounded-card bg-card p-4 hover:bg-card-hover"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold">{b.name}</h3>
                      {statusBadge(b.status)}
                    </div>
                    <div className="mt-1 flex flex-wrap items-baseline gap-x-2 text-xs text-text-tertiary">
                      {b.style && (
                        <span>
                          {BLOCK_STYLE_LABELS[b.style as BlockStyle] ?? b.style}
                        </span>
                      )}
                      {range && <span>· {range}</span>}
                      <span>
                        · {b.workoutCount} workout
                        {b.workoutCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    {b.weeklySplitSummary && (
                      <p className="mt-1 truncate text-xs text-text-secondary">
                        {b.weeklySplitSummary}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
