"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Point {
  weekStart: string;
  weightLbs: number;
}

interface Props {
  data: Point[];
}

export function WeightChart({ data }: Props) {
  if (data.length < 2) {
    return (
      <div className="rounded-card bg-card p-6 text-center text-sm text-text-tertiary">
        Log at least two weeks to see the trend.
      </div>
    );
  }

  return (
    <div className="rounded-card bg-card p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">
        Weight trend
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 0, left: -12 }}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
            <XAxis
              dataKey="weekStart"
              tickFormatter={(v: string) => {
                const d = new Date(v);
                return d.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                });
              }}
              tick={{ fill: "rgb(163 163 163)", fontSize: 11 }}
              stroke="rgba(255,255,255,0.06)"
            />
            <YAxis
              tick={{ fill: "rgb(163 163 163)", fontSize: 11 }}
              stroke="rgba(255,255,255,0.06)"
              domain={["dataMin - 2", "dataMax + 2"]}
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
              formatter={(v: number) => [`${v} lb`, "Weight"]}
            />
            <Line
              type="monotone"
              dataKey="weightLbs"
              stroke="rgb(59 130 246)"
              strokeWidth={2}
              dot={{ fill: "rgb(59 130 246)", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
