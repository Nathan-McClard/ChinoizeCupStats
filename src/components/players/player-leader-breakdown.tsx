"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { ImagePieChart, type PieSlice } from "@/components/ui/image-pie-chart";
import { LeaderIcon, getLeaderImageUrlFromData } from "@/components/ui/leader-icon";
import { CHART_COLORS } from "@/lib/charts";
import type { PlayerTournamentRow } from "./player-tournament-history";

interface PlayerLeaderBreakdownProps {
  rows: PlayerTournamentRow[];
}

export function PlayerLeaderBreakdown({ rows }: PlayerLeaderBreakdownProps) {
  // Group by leader, keeping first set/number for images
  const leaderCounts: Record<
    string,
    {
      name: string;
      count: number;
      leaderSet: string | null;
      leaderNumber: string | null;
      deckId: string | null;
    }
  > = {};

  for (const r of rows) {
    const key = r.leaderName || "Unknown";
    if (!leaderCounts[key]) {
      leaderCounts[key] = {
        name: key,
        count: 0,
        leaderSet: r.leaderSet,
        leaderNumber: r.leaderNumber,
        deckId: r.deckId,
      };
    }
    leaderCounts[key].count++;
  }

  const sorted = Object.values(leaderCounts).sort(
    (a, b) => b.count - a.count
  );
  const total = rows.length;

  const top8 = sorted.slice(0, 8);
  const rest = sorted.slice(8);
  const otherCount = rest.reduce((sum, d) => sum + d.count, 0);

  const slices: PieSlice[] = top8.map((d, i) => ({
    name: d.name,
    value: d.count,
    imageUrl: getLeaderImageUrlFromData(d.leaderSet, d.leaderNumber, d.deckId),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  if (otherCount > 0) {
    slices.push({
      name: "Other",
      value: otherCount,
      color: CHART_COLORS[8 % CHART_COLORS.length],
    });
  }

  return (
    <GlassCard
      className="p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Leaders Played
      </h3>

      {slices.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No leader data available
        </div>
      ) : (
        <>
          <ImagePieChart data={slices} size={220} tooltipUnit="events" />

          {/* Summary list */}
          <div className="mt-5 space-y-2 border-t border-border pt-4">
            {slices.slice(0, 5).map((entry, i) => (
              <div
                key={entry.name}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  {top8[i]?.leaderSet && top8[i]?.leaderNumber ? (
                    <LeaderIcon
                      set={top8[i].leaderSet!}
                      number={top8[i].leaderNumber!}
                      name={entry.name}
                      size={20}
                      className="rounded"
                    />
                  ) : (
                    <div
                      className="w-5 h-5 rounded flex-shrink-0"
                      style={{
                        backgroundColor:
                          CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                  )}
                  <span className="text-foreground truncate">{entry.name}</span>
                </div>
                <span className="text-muted-foreground font-mono">
                  {entry.value} (
                  {total > 0
                    ? ((entry.value / total) * 100).toFixed(1)
                    : "0.0"}
                  %)
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </GlassCard>
  );
}
