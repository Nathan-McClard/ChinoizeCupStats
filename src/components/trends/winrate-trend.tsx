"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";
import { CHART_COLORS, chartTheme } from "@/lib/charts";

interface WinRateEntry {
  date: string;
  deckId: string;
  leaderName: string;
  winRate: number;
}

interface TopLeader {
  deckId: string;
  leaderName: string;
}

interface WinrateTrendProps {
  data: WinRateEntry[];
  topLeaders: TopLeader[];
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;

  const formattedDate = (() => {
    try {
      return format(parseISO(label), "MMM d, yyyy");
    } catch {
      return label;
    }
  })();

  const sorted = [...payload]
    .filter((p) => p.value !== undefined && p.value !== null)
    .sort((a, b) => b.value - a.value);

  return (
    <div style={chartTheme.tooltipStyle}>
      <p className="font-semibold text-sm mb-2">{formattedDate}</p>
      <div className="space-y-1">
        {sorted.map((entry) => (
          <div
            key={entry.dataKey}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
            <span className="font-medium text-foreground">
              {(entry.value * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WinrateTrend({ data, topLeaders }: WinrateTrendProps) {
  const topDeckIds = useMemo(
    () => new Set(topLeaders.map((l) => l.deckId)),
    [topLeaders]
  );

  const leaderNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const l of topLeaders) {
      map[l.deckId] = l.leaderName;
    }
    return map;
  }, [topLeaders]);

  const chartData = useMemo(() => {
    // Group data by date
    const byDate: Record<string, Record<string, number>> = {};

    for (const entry of data) {
      if (!topDeckIds.has(entry.deckId)) continue;

      if (!byDate[entry.date]) {
        byDate[entry.date] = {};
      }
      byDate[entry.date][entry.deckId] = entry.winRate;
    }

    // Sort dates and build flat array
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, leaders]) => {
        const row: Record<string, string | number | undefined> = { date };
        for (const l of topLeaders) {
          row[l.deckId] = leaders[l.deckId] ?? undefined;
        }
        return row;
      });
  }, [data, topLeaders, topDeckIds]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No win rate trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={chartTheme.gridColor}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ ...chartTheme.axisStyle }}
          tickLine={false}
          axisLine={{ stroke: chartTheme.axisStyle.stroke }}
          tickFormatter={(value: string) => {
            try {
              return format(parseISO(value), "MMM d");
            } catch {
              return value;
            }
          }}
        />
        <YAxis
          tick={{ ...chartTheme.axisStyle }}
          tickLine={false}
          axisLine={{ stroke: chartTheme.axisStyle.stroke }}
          domain={[0, 1]}
          tickFormatter={(value: number) => `${(value * 100).toFixed(0)}%`}
        />
        <ReferenceLine
          y={0.5}
          stroke="var(--border)"
          strokeDasharray="6 4"
          label={{
            value: "50%",
            position: "right",
            fill: "var(--muted-foreground)",
            fontSize: 11,
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span className="text-xs text-muted-foreground">
              {leaderNameMap[value] || value}
            </span>
          )}
          wrapperStyle={{ paddingTop: "12px" }}
        />
        {topLeaders.map((leader, index) => (
          <Line
            key={leader.deckId}
            type="monotone"
            dataKey={leader.deckId}
            name={leader.leaderName}
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3, fill: CHART_COLORS[index % CHART_COLORS.length] }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--background)" }}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
