"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { ImagePieChart, type PieSlice } from "@/components/ui/image-pie-chart";
import { LeaderIcon, getLeaderImageUrlFromData } from "@/components/ui/leader-icon";
import { CHART_COLORS } from "@/lib/charts";

interface Standing {
  tournamentId: string;
  player: string;
  displayName: string;
  country: string;
  placing: number | null;
  wins: number;
  losses: number;
  ties: number;
  dropRound: number | null;
  deckId: string | null;
  deckName: string | null;
  leaderName: string | null;
  leaderSet: string | null;
  leaderNumber: string | null;
}

interface TournamentMetaPieProps {
  standings: Standing[];
}

export function TournamentMetaPie({ standings }: TournamentMetaPieProps) {
  // Aggregate leader counts, keeping first set/number for images
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

  for (const s of standings) {
    const key = s.leaderName || "Unknown";
    if (!leaderCounts[key]) {
      leaderCounts[key] = {
        name: key,
        count: 0,
        leaderSet: s.leaderSet,
        leaderNumber: s.leaderNumber,
        deckId: s.deckId,
      };
    }
    leaderCounts[key].count++;
  }

  const sorted = Object.values(leaderCounts).sort(
    (a, b) => b.count - a.count
  );
  const totalPlayers = standings.length;

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
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Leader Distribution
      </h3>

      {slices.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No leader data available
        </div>
      ) : (
        <>
          <ImagePieChart data={slices} size={220} tooltipUnit="players" />

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
                  {totalPlayers > 0
                    ? ((entry.value / totalPlayers) * 100).toFixed(1)
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
