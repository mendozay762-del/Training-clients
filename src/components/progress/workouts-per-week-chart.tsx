"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  data: { weekStart: string; count: number }[];
}

export function WorkoutsPerWeekChart({ data }: Props) {
  const hasAny = data.some((d) => d.count > 0);
  if (!hasAny) {
    return (
      <div className="rounded-card bg-card p-6 text-center text-sm text-text-tertiary">
        No workouts logged in the last 12 weeks.
      </div>
    );
  }

  return (
    <div className="rounded-card bg-card p-4">
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
        Workouts per week · last 12
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
              formatter={(v: number) => [
                `${v} workout${v === 1 ? "" : "s"}`,
                "",
              ]}
            />
            <Bar dataKey="count" fill="rgb(59 130 246)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
