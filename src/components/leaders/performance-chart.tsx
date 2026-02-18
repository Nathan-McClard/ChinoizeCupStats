"use client";

import { motion } from "framer-motion";
import { CHART_COLORS, chartTheme } from "@/lib/charts";
import { TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface TrendDataPoint {
  date: string;
  winRate: number;
  playRate: number;
  entries: number;
}

interface PerformanceChartProps {
  trends: TrendDataPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div style={chartTheme.tooltipStyle}>
      <p className="text-xs font-medium text-foreground mb-1.5">
        {(() => {
          try {
            return format(parseISO(label), "MMM d, yyyy");
          } catch {
            return label;
          }
        })()}
      </p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toFixed(1)}%
        </p>
      ))}
    </div>
  );
}

export function PerformanceChart({ trends }: PerformanceChartProps) {
  const chartData = trends.map((t) => ({
    date: t.date,
    winRate: t.winRate * 100,
    playRate: t.playRate * 100,
    entries: t.entries,
  }));

  const blurIn = {
    hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  if (chartData.length === 0) {
    return (
      <motion.div
        variants={blurIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="relative overflow-hidden rounded-2xl bg-card border border-border p-6"
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--accent-line), transparent)",
          }}
        />
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Performance Over Time
          </h3>
        </div>
        <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
          No trend data available
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={blurIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="relative overflow-hidden rounded-2xl bg-card border border-border p-6"
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--accent-line), transparent)",
        }}
      />
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Performance Over Time
        </h3>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartTheme.gridColor}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ ...chartTheme.axisStyle }}
              stroke={chartTheme.axisStyle.stroke}
              tickFormatter={(value) => {
                try {
                  return format(parseISO(value), "MMM d");
                } catch {
                  return value;
                }
              }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ ...chartTheme.axisStyle }}
              stroke={chartTheme.axisStyle.stroke}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              width={45}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ ...chartTheme.axisStyle }}
              stroke={chartTheme.axisStyle.stroke}
              tickFormatter={(value) => `${value}%`}
              domain={[0, "auto"]}
              tickLine={false}
              axisLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "12px", color: chartTheme.textColor }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="winRate"
              name="Win Rate"
              stroke={CHART_COLORS[0]}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS[0], r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: CHART_COLORS[0], strokeWidth: 2, fill: "var(--background)" }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="playRate"
              name="Play Rate"
              stroke={CHART_COLORS[1]}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: CHART_COLORS[1], r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: CHART_COLORS[1], strokeWidth: 2, fill: "var(--background)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
