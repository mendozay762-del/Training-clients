import type { Goal } from "@/db/schema";

interface Props {
  goals: Goal[];
}

function daysUntil(target: string): number {
  const t = new Date(target).getTime();
  return Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24));
}

export function GoalProgress({ goals }: Props) {
  const total = goals.length;
  const done = goals.filter((g) => g.done).length;
  const open = goals.filter((g) => !g.done);

  if (total === 0) {
    return (
      <div className="rounded-card bg-card p-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
          Goals
        </div>
        <p className="text-sm text-text-tertiary">No goals set yet.</p>
      </div>
    );
  }

  const pct = Math.round((done / total) * 100);

  return (
    <div className="rounded-card bg-card p-4">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          Goals
        </span>
        <span className="text-xs text-text-tertiary tabnums">
          {done} of {total} complete · {pct}%
        </span>
      </div>

      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full bg-accent-blue transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {open.length > 0 ? (
        <ul className="flex flex-col gap-2.5">
          {open.map((g) => {
            const days = g.targetDate ? daysUntil(g.targetDate) : null;
            const dueLabel =
              days === null
                ? null
                : days < 0
                  ? `${Math.abs(days)}d overdue`
                  : days === 0
                    ? "due today"
                    : days <= 30
                      ? `${days}d to go`
                      : `${Math.round(days / 30)}mo to go`;
            return (
              <li
                key={g.id}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <span className="text-text-primary">{g.body}</span>
                {dueLabel && (
                  <span
                    className={
                      days !== null && days < 0
                        ? "text-xs text-accent-red tabnums"
                        : "text-xs text-text-tertiary tabnums"
                    }
                  >
                    {dueLabel}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-text-tertiary">
          All goals complete. Time to set a new one.
        </p>
      )}
    </div>
  );
}
