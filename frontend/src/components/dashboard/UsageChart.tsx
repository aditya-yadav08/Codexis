"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface UsageChartProps {
  data: { date: string; count: number }[];
}

export function UsageChart({ data }: UsageChartProps) {
  return (
    <div className="h-full w-full min-h-[200px] animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--theme-primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--theme-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--chart-grid)"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--chart-text)", fontSize: 10 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--chart-text)", fontSize: 10 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--chart-tooltip-bg)",
              border: "1px solid var(--chart-tooltip-border)",
              borderRadius: "12px",
              fontSize: "12px",
              color: "var(--chart-tooltip-text)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
            }}
            itemStyle={{ color: "var(--theme-primary)" }}
            cursor={{ stroke: "var(--theme-primary)", strokeOpacity: 0.2, strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--theme-primary)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#usageGradient)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
