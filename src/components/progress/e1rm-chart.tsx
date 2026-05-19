"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { E1rmPoint } from "@/lib/queries/clients";

const LINE_COLORS = [
  "rgb(59 130 246)",
  "rgb(244 114 182)",
  "rgb(34 197 94)",
  "rgb(251 191 36)",
];

interface Props {
  data: E1rmPoint[];
}

export function E1rmChart({ data }: Props) {
  const { rows, exercises } = useMemo(() => buildPivot(data), [data]);

  if (rows.length < 2 || exercises.length === 0) {
    return (
      <div className="rounded-card bg-card p-6 text-center text-sm text-text-tertiary">
        Log a working set across at least 3 sessions on the same lift to see
        the e1RM trend.
      </div>
    );
  }

  return (
    <div className="rounded-card bg-card p-4">
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
        Estimated 1-rep max · top {exercises.length} lift
        {exercises.length === 1 ? "" : "s"}
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={rows}
            margin={{ top: 4, right: 4, bottom: 0, left: -12 }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="2 2"
            />
            <XAxis
              dataKey="performedOn"
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
              tick={{ fill: "rgb(163 163 163)", fontSize: 11 }}
              stroke="rgba(255,255,255,0.06)"
              domain={["dataMin - 10", "dataMax + 10"]}
              tickFormatter={(v: number) => `${Math.round(v)}`}
            />
            <Tooltip
              contentStyle={{
                background: "rgb(31 31 31)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "rgb(163 163 163)" }}
              labelFormatter={(v: string) =>
                new Date(v).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              }
              formatter={(v: number) => [`${Math.round(v)} lb`]}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "rgb(163 163 163)" }}
              iconType="plainline"
            />
            {exercises.map((ex, i) => (
              <Line
                key={ex}
                type="monotone"
                dataKey={ex}
                name={ex}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={2}
                dot={{
                  fill: LINE_COLORS[i % LINE_COLORS.length],
                  r: 2.5,
                }}
                activeDot={{ r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function buildPivot(data: E1rmPoint[]) {
  const exerciseSet = new Set<string>();
  const byDate = new Map<string, Record<string, number>>();

  for (const p of data) {
    exerciseSet.add(p.exerciseName);
    const existing = byDate.get(p.performedOn) ?? {};
    existing[p.exerciseName] = Math.max(
      existing[p.exerciseName] ?? 0,
      p.e1rm,
    );
    byDate.set(p.performedOn, existing);
  }

  const exercises = Array.from(exerciseSet);
  const rows = Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([performedOn, values]) => ({ performedOn, ...values }));

  return { rows, exercises };
}
