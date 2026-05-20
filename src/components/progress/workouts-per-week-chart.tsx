"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdherenceWeek } from "@/lib/queries/clients";

interface Props {
  data: AdherenceWeek[];
}

export function WorkoutsPerWeekChart({ data }: Props) {
  const hasAny = data.some(
    (d) => d.completed > 0 || d.prescribed > 0 || d.skipped > 0,
  );
  if (!hasAny) {
    return (
      <div className="rounded-card bg-card p-6 text-center text-sm text-text-tertiary">
        No workouts in the last 12 weeks.
      </div>
    );
  }

  const hasPrescriptions = data.some((d) => d.prescribed > 0 || d.skipped > 0);

  const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);
  const totalPrescribed = data.reduce((sum, d) => sum + d.prescribed, 0);
  const adherencePct =
    totalPrescribed > 0
      ? Math.round((Math.min(totalCompleted, totalPrescribed) / totalPrescribed) * 100)
      : null;

  return (
    <div className="rounded-card bg-card p-4">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          {hasPrescriptions ? "Adherence" : "Workouts per week"} · last 12
        </span>
        {adherencePct !== null && (
          <span className="text-xs text-text-tertiary tabnums">
            {totalCompleted}/{totalPrescribed} · {adherencePct}%
          </span>
        )}
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="2 2"
              vertical={false}
            />
            <XAxis
              dataKey="weekStart"
              tickFormatter={(v: string) =>
                new Date(v).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              }
              tick={{ fill: "rgb(163 163 163)", fontSize: 11 }}
              stroke="rgba(255,255,255,0.06)"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "rgb(163 163 163)", fontSize: 11 }}
              stroke="rgba(255,255,255,0.06)"
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "rgb(31 31 31)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "rgb(163 163 163)" }}
              labelFormatter={(v: string) =>
                `Week of ${new Date(v).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}`
              }
            />
            {hasPrescriptions && (
              <Legend
                wrapperStyle={{ fontSize: 11, color: "rgb(163 163 163)" }}
                iconType="square"
              />
            )}
            {hasPrescriptions && (
              <Bar
                dataKey="prescribed"
                name="Prescribed"
                fill="rgba(59,130,246,0.25)"
                radius={[3, 3, 0, 0]}
              />
            )}
            <Bar
              dataKey="completed"
              name={hasPrescriptions ? "Completed" : "Workouts"}
              fill="rgb(59 130 246)"
              radius={[3, 3, 0, 0]}
            />
            {hasPrescriptions && (
              <Bar
                dataKey="skipped"
                name="Skipped"
                fill="rgba(251,191,36,0.5)"
                radius={[3, 3, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
