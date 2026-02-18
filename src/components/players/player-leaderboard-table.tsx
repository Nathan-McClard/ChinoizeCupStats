"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import { Trophy, Search, ChevronDown, ChevronUp, Info } from "lucide-react";
import type { PlayerLeaderboardRow } from "@/lib/queries/players";

type SortKey =
  | "rank"
  | "totalPoints"
  | "tournamentsPlayed"
  | "winRate"
  | "bestPlacing"
  | "top4Count";

type SortDir = "asc" | "desc";

const POINTS_LEGEND = [
  { placing: "1st", points: 16 },
  { placing: "2nd", points: 12 },
  { placing: "3rd-4th", points: 8 },
  { placing: "5th-8th", points: 6 },
  { placing: "9th-16th", points: 4 },
  { placing: "17th-32nd", points: 2 },
  { placing: "33rd-64th", points: 1 },
];

function getWinRateColor(winRate: number): string {
  if (winRate > 0.55) return "bg-emerald-500";
  if (winRate >= 0.45) return "bg-amber-500";
  return "bg-red-500";
}

function getWinRateTextColor(winRate: number): string {
  if (winRate > 0.55) return "text-emerald-400";
  if (winRate >= 0.45) return "text-amber-400";
  return "text-red-400";
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-400/20">
        <Trophy className="w-4 h-4 text-amber-400" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-300/10 font-bold text-sm text-slate-500 dark:text-slate-300">
        {rank}
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-700/10 font-bold text-sm text-amber-600">
        {rank}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] text-muted-foreground text-sm font-medium">
      {rank}
    </div>
  );
}

interface PlayerLeaderboardTableProps {
  players: PlayerLeaderboardRow[];
}

export function PlayerLeaderboardTable({
  players,
}: PlayerLeaderboardTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showAll, setShowAll] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return players;
    const q = search.toLowerCase();
    return players.filter(
      (p) =>
        p.displayName.toLowerCase().includes(q) ||
        p.player.toLowerCase().includes(q)
    );
  }, [players, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "rank":
          cmp = a.rank - b.rank;
          break;
        case "totalPoints":
          cmp = a.totalPoints - b.totalPoints;
          break;
        case "tournamentsPlayed":
          cmp = a.tournamentsPlayed - b.tournamentsPlayed;
          break;
        case "winRate":
          cmp = a.winRate - b.winRate;
          break;
        case "bestPlacing":
          // Lower placing is better, so invert for "desc"
          cmp = a.bestPlacing - b.bestPlacing;
          break;
        case "top4Count":
          cmp = a.top4Count - b.top4Count;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const displayed = showAll || search.trim() ? sorted : sorted.slice(0, 100);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // Default to desc for most columns, asc for rank and bestPlacing
      setSortDir(key === "rank" || key === "bestPlacing" ? "asc" : "desc");
    }
  }

  function SortHeader({
    label,
    sortKeyName,
    className,
  }: {
    label: string;
    sortKeyName: SortKey;
    className?: string;
  }) {
    const active = sortKey === sortKeyName;
    return (
      <th
        className={cn(
          "text-left text-xs font-medium uppercase tracking-wider px-3 py-3 cursor-pointer select-none transition-colors hover:text-foreground",
          active ? "text-primary" : "text-muted-foreground",
          className
        )}
        onClick={() => toggleSort(sortKeyName)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {active &&
            (sortDir === "asc" ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            ))}
        </span>
      </th>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
          />
        </div>
        <button
          onClick={() => setLegendOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          Points System
        </button>
      </div>

      {/* Points Legend */}
      {legendOpen && (
        <GlassCard className="p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">
            Points by Placing (excluded if player dropped)
          </h4>
          <div className="flex flex-wrap gap-3">
            {POINTS_LEGEND.map((entry) => (
              <div
                key={entry.placing}
                className="flex items-center gap-2 text-xs"
              >
                <span className="text-muted-foreground">{entry.placing}:</span>
                <span className="font-semibold text-primary">
                  {entry.points}pts
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Table */}
      <GlassCard
        className="p-0 overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <SortHeader label="Rank" sortKeyName="rank" className="px-5 w-16" />
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-3">
                  Player
                </th>
                <SortHeader label="Points" sortKeyName="totalPoints" />
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-3">
                  Record
                </th>
                <SortHeader label="Events" sortKeyName="tournamentsPlayed" />
                <SortHeader label="Win %" sortKeyName="winRate" />
                <SortHeader label="Best" sortKeyName="bestPlacing" />
                <SortHeader label="Top 4" sortKeyName="top4Count" />
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-3">
                  Fav Leader
                </th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((player) => {
                const isTop3 = player.rank <= 3;
                return (
                  <tr
                    key={player.player}
                    className={cn(
                      "border-b border-border transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]",
                      player.rank === 1 &&
                        "border-l-2 border-l-amber-400 bg-amber-400/10",
                      player.rank === 2 &&
                        "border-l-2 border-l-slate-300 bg-slate-300/10",
                      player.rank === 3 &&
                        "border-l-2 border-l-amber-600 bg-amber-700/10",
                      isTop3 ? "" : "bg-transparent"
                    )}
                  >
                    {/* Rank */}
                    <td className="px-5 py-3">
                      <RankBadge rank={player.rank} />
                    </td>

                    {/* Player */}
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <Link
                          href={`/players/${encodeURIComponent(player.player)}`}
                          className={cn(
                            "text-sm font-medium hover:text-primary transition-colors",
                            player.rank === 1
                              ? "text-amber-400"
                              : player.rank === 2
                                ? "text-slate-500 dark:text-slate-300"
                                : player.rank === 3
                                  ? "text-amber-600"
                                  : "text-foreground"
                          )}
                        >
                          {player.displayName}
                        </Link>
                        {player.country && (
                          <span className="text-xs text-muted-foreground">
                            {player.country}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Points */}
                    <td className="px-3 py-3">
                      <span className="text-sm font-semibold text-primary">
                        {player.totalPoints}
                      </span>
                    </td>

                    {/* Record */}
                    <td className="px-3 py-3">
                      <span className="text-sm font-data text-foreground">
                        <span className="text-emerald-400">
                          {player.totalWins}
                        </span>
                        <span className="text-muted-foreground">-</span>
                        <span className="text-red-400">
                          {player.totalLosses}
                        </span>
                        {player.totalTies > 0 && (
                          <>
                            <span className="text-muted-foreground">-</span>
                            <span className="text-blue-400">
                              {player.totalTies}
                            </span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Events */}
                    <td className="px-3 py-3">
                      <span className="text-sm text-foreground">
                        {player.tournamentsPlayed}
                      </span>
                    </td>

                    {/* Win % */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="h-1.5 flex-1 rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-700",
                              getWinRateColor(player.winRate)
                            )}
                            style={{
                              width: `${Math.min(player.winRate * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-xs font-semibold tabular-nums w-12 text-right",
                            getWinRateTextColor(player.winRate)
                          )}
                        >
                          {(player.winRate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    {/* Best Placing */}
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "text-sm",
                          player.bestPlacing === 1
                            ? "text-amber-400 font-bold"
                            : player.bestPlacing <= 4
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
                        )}
                      >
                        {player.bestPlacing || "--"}
                      </span>
                    </td>

                    {/* Top 4 */}
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "text-sm",
                          player.top4Count > 0
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {player.top4Count}
                      </span>
                    </td>

                    {/* Favorite Leader */}
                    <td className="px-3 py-3">
                      <span className="text-sm text-foreground truncate">
                        {player.mostPlayedLeaderName}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Show All toggle */}
        {!search.trim() && sorted.length > 100 && (
          <div className="p-3 border-t border-border text-center">
            <button
              onClick={() => setShowAll((s) => !s)}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {showAll
                ? "Show Top 100"
                : `Show All ${sorted.length} Players`}
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
