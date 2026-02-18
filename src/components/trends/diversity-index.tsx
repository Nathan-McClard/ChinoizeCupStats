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
} from "recharts";
import { format, parseISO } from "date-fns";
import { CHART_COLORS, chartTheme } from "@/lib/charts";

interface DiversityEntry {
  tournamentId: string;
  date: string;
  diversityIndex: number;
  uniqueLeaders: number;
}

interface DiversityIndexProps {
  data: DiversityEntry[];
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

  const diversityEntry = payload.find((p) => p.dataKey === "diversityIndex");
  const leadersEntry = payload.find((p) => p.dataKey === "uniqueLeaders");

  return (
    <div style={chartTheme.tooltipStyle}>
      <p className="font-semibold text-sm mb-2">{formattedDate}</p>
      <div className="space-y-1.5">
        {diversityEntry && (
          <div className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: CHART_COLORS[4] }}
              />
              <span className="text-muted-foreground">Shannon Index</span>
            </div>
            <span className="font-medium text-warning">
              {diversityEntry.value.toFixed(3)}
            </span>
          </div>
        )}
        {leadersEntry && (
          <div className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: CHART_COLORS[0] }}
              />
              <span className="text-muted-foreground">Unique Leaders</span>
            </div>
            <span className="font-medium text-primary">
              {leadersEntry.value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function DiversityIndex({ data }: DiversityIndexProps) {
  const chartData = useMemo(() => {
    return data.map((entry) => ({
      date: entry.date,
      diversityIndex: entry.diversityIndex,
      uniqueLeaders: entry.uniqueLeaders,
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No diversity data available
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
        {/* Left Y-axis: Shannon diversity index */}
        <YAxis
          yAxisId="diversity"
          orientation="left"
          tick={{ ...chartTheme.axisStyle }}
          tickLine={false}
          axisLine={{ stroke: chartTheme.axisStyle.stroke }}
          label={{
            value: "Shannon Index",
            angle: -90,
            position: "insideLeft",
            offset: 10,
            style: { fill: CHART_COLORS[4], fontSize: 11 },
          }}
        />
        {/* Right Y-axis: unique leader count */}
        <YAxis
          yAxisId="leaders"
          orientation="right"
          tick={{ ...chartTheme.axisStyle }}
          tickLine={false}
          axisLine={{ stroke: chartTheme.axisStyle.stroke }}
          allowDecimals={false}
          label={{
            value: "Unique Leaders",
            angle: 90,
            position: "insideRight",
            offset: 10,
            style: { fill: CHART_COLORS[0], fontSize: 11 },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => {
            const labels: Record<string, string> = {
              diversityIndex: "Shannon Index",
              uniqueLeaders: "Unique Leaders",
            };
            return (
              <span className="text-xs text-muted-foreground">
                {labels[value] || value}
              </span>
            );
          }}
          wrapperStyle={{ paddingTop: "12px" }}
        />
        <Line
          yAxisId="diversity"
          type="monotone"
          dataKey="diversityIndex"
          name="diversityIndex"
          stroke={CHART_COLORS[4]}
          strokeWidth={2.5}
          dot={{ r: 4, fill: CHART_COLORS[4], stroke: "var(--background)", strokeWidth: 2 }}
          activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--background)" }}
        />
        <Line
          yAxisId="leaders"
          type="monotone"
          dataKey="uniqueLeaders"
          name="uniqueLeaders"
          stroke={CHART_COLORS[0]}
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={{ r: 3, fill: CHART_COLORS[0], stroke: "var(--background)", strokeWidth: 2 }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--background)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
