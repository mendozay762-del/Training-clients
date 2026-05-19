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

interface Props {
  label: string;
  unit: string;
  data: { weekStart: string; value: number }[];
}

export function BodyMetricChart({ label, unit, data }: Props) {
  if (data.length < 2) {
    return (
      <div className="rounded-card bg-card p-6 text-center text-sm text-text-tertiary">
        Log at least two weeks of {label.toLowerCase()} to see a trend.
      </div>
    );
  }

  return (
    <div className="rounded-card bg-card p-4">
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
        {label} trend
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 0, left: -12 }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="2 2"
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
              tick={{ fill: "rgb(163 163 163)", fontSize: 11 }}
              stroke="rgba(255,255,255,0.06)"
              domain={["dataMin - 1", "dataMax + 1"]}
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
              formatter={(v: number) => [`${v} ${unit}`, label]}
            />
            <Line
              type="monotone"
              dataKey="value"
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
