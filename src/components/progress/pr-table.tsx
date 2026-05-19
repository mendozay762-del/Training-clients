import type { ClientPr } from "@/lib/queries/clients";

interface Props {
  prs: ClientPr[];
}

export function PrTable({ prs }: Props) {
  if (prs.length === 0) {
    return (
      <div className="rounded-card bg-card p-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
          PRs
        </div>
        <p className="text-sm text-text-tertiary">
          No top sets logged yet — log a working set on any lift.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card bg-card p-4">
      <div className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
        PRs · top set per lift
      </div>
      <ul className="flex flex-col divide-y divide-white/[0.04]">
        {prs.map((pr) => (
          <li
            key={pr.exerciseName}
            className="flex items-baseline justify-between gap-3 py-2.5 text-sm"
          >
            <span className="font-medium">{pr.exerciseName}</span>
            <span className="flex items-baseline gap-2 text-right tabnums">
              <span className="font-semibold">
                {pr.weightLbs} lb × {pr.reps}
              </span>
              <span className="text-xs text-text-tertiary">
                e1RM {Math.round(pr.e1rm)} ·{" "}
                {new Date(pr.performedOn).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
