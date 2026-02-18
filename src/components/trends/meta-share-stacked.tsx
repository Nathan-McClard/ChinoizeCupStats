"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { CHART_COLORS, chartTheme } from "@/lib/charts";

interface MetaTrendEntry {
  date: string;
  leaders: Record<string, { name: string; count: number; total: number }>;
}

interface TopLeader {
  deckId: string;
  leaderName: string;
}

interface MetaShareStackedProps {
  data: MetaTrendEntry[];
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

  // Sort by value descending for the tooltip
  const sorted = [...payload]
    .filter((p) => p.value > 0)
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
              {entry.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MetaShareStacked({ data, topLeaders }: MetaShareStackedProps) {
  const topDeckIds = useMemo(
    () => new Set(topLeaders.map((l) => l.deckId)),
    [topLeaders]
  );

  const leaderNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const l of topLeaders) {
      map[l.deckId] = l.leaderName;
    }
    map["Other"] = "Other";
    return map;
  }, [topLeaders]);

  const chartData = useMemo(() => {
    return data.map((entry) => {
      const row: Record<string, string | number> = {};

      try {
        row.date = entry.date;
        row.dateLabel = format(parseISO(entry.date), "MMM d");
      } catch {
        row.date = entry.date;
        row.dateLabel = entry.date;
      }

      // Calculate total across all leaders for this date
      let grandTotal = 0;
      for (const info of Object.values(entry.leaders)) {
        grandTotal += info.count;
      }

      if (grandTotal === 0) {
        for (const l of topLeaders) {
          row[l.deckId] = 0;
        }
        row["Other"] = 0;
        return row;
      }

      let otherCount = 0;

      for (const [deckId, info] of Object.entries(entry.leaders)) {
        if (topDeckIds.has(deckId)) {
          row[deckId] = (info.count / grandTotal) * 100;
        } else {
          otherCount += info.count;
        }
      }

      // Fill in missing leaders with 0
      for (const l of topLeaders) {
        if (row[l.deckId] === undefined) {
          row[l.deckId] = 0;
        }
      }

      row["Other"] = (otherCount / grandTotal) * 100;

      return row;
    });
  }, [data, topLeaders, topDeckIds]);

  // Build area keys: top leaders + "Other"
  const areaKeys = useMemo(() => {
    const keys = topLeaders.map((l) => l.deckId);
    keys.push("Other");
    return keys;
  }, [topLeaders]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No meta trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
          domain={[0, 100]}
          tickFormatter={(value: number) => `${value}%`}
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
        {areaKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            name={leaderNameMap[key] || key}
            stackId="meta"
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            fillOpacity={0.6}
            strokeWidth={1.5}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
