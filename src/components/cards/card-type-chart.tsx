"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { GlassCard } from "@/components/ui/glass-card";
import { CHART_COLORS, chartTheme } from "@/lib/charts";

interface CardData {
  cardName: string;
  cardSet: string;
  cardNumber: string;
  cardType: string;
  cardId: string;
  totalDecks: number;
  avgCopies: number;
  totalCopies: number;
}

interface CardTypeChartProps {
  cards: CardData[];
}

interface TypeAggregation {
  type: string;
  count: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: TypeAggregation }>;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;

  return (
    <div style={chartTheme.tooltipStyle}>
      <p className="font-semibold text-sm mb-1">{entry.type}</p>
      <p className="text-xs text-muted-foreground">
        {entry.count} unique card{entry.count !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function CardTypeChart({ cards }: CardTypeChartProps) {
  const chartData = useMemo(() => {
    const typeMap = new Map<string, number>();

    for (const card of cards) {
      const type = card.cardType || "Unknown";
      typeMap.set(type, (typeMap.get(type) ?? 0) + 1);
    }

    const aggregated: TypeAggregation[] = Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return aggregated;
  }, [cards]);

  return (
    <GlassCard
      className="p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <h3 className="text-lg font-semibold text-foreground mb-1">
        Cards by Type
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Unique card count per card type
      </p>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 20, bottom: 0, left: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartTheme.gridColor}
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ ...chartTheme.axisStyle }}
              axisLine={{ stroke: chartTheme.axisStyle.stroke }}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="type"
              tick={{ ...chartTheme.axisStyle }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "var(--border)" }}
            />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              barSize={28}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </GlassCard>
  );
}
