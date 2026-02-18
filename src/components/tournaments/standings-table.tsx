"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { LeaderIcon } from "@/components/ui/leader-icon";
import { GlassCard } from "@/components/ui/glass-card";
import { Trophy } from "lucide-react";

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

interface StandingsTableProps {
  standings: Standing[];
}

const placingStyles: Record<number, { bg: string; text: string; border: string }> = {
  1: {
    bg: "bg-amber-400/10",
    text: "text-amber-400",
    border: "border-l-amber-400",
  },
  2: {
    bg: "bg-slate-300/10",
    text: "text-slate-500 dark:text-slate-300",
    border: "border-l-slate-400 dark:border-l-slate-300",
  },
  3: {
    bg: "bg-amber-700/10",
    text: "text-amber-600",
    border: "border-l-amber-600",
  },
};

function PlacingBadge({ placing }: { placing: number }) {
  if (placing === 1) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-400/20">
        <Trophy className="w-4 h-4 text-amber-400" />
      </div>
    );
  }

  const style = placingStyles[placing];
  if (style) {
    return (
      <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm", style.bg, style.text)}>
        {placing}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] text-muted-foreground text-sm font-medium">
      {placing}
    </div>
  );
}

export function StandingsTable({ standings }: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No standings data available.
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      className="p-0 overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="p-5 pb-3 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Standings</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 w-16">
                Place
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-3">
                Player
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-3">
                Leader
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-3 w-28">
                Record
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-3 w-16">
                Drop
              </th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => {
              const placing = standing.placing ?? (index + 1);
              const rowStyle = placingStyles[placing];
              const isTopCut = placing <= 8;

              return (
                <tr
                  key={`${standing.tournamentId}-${standing.player}`}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]",
                    rowStyle && "border-l-2",
                    rowStyle?.border,
                    rowStyle?.bg,
                    isTopCut && !rowStyle && "bg-black/[0.02] dark:bg-white/[0.02]"
                  )}
                >
                  {/* Placing */}
                  <td className="px-5 py-3">
                    <PlacingBadge placing={placing} />
                  </td>

                  {/* Player */}
                  <td className="px-3 py-3">
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          rowStyle ? rowStyle.text : "text-foreground"
                        )}
                      >
                        {standing.displayName}
                      </span>
                      {standing.country && (
                        <span className="text-xs text-muted-foreground">
                          {standing.country}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Leader */}
                  <td className="px-3 py-3">
                    {standing.leaderName ? (
                      <div className="flex items-center gap-2">
                        {standing.leaderSet && standing.leaderNumber && (
                          <LeaderIcon
                            set={standing.leaderSet}
                            number={standing.leaderNumber}
                            name={standing.leaderName}
                            size={32}
                          />
                        )}
                        <div className="flex flex-col min-w-0">
                          {standing.deckId ? (
                            <Link
                              href={`/decklists/${standing.tournamentId}/${standing.player}`}
                              className="text-sm text-foreground hover:text-primary transition-colors truncate"
                            >
                              {standing.leaderName}
                            </Link>
                          ) : (
                            <span className="text-sm text-foreground truncate">
                              {standing.leaderName}
                            </span>
                          )}
                          {standing.deckName && standing.deckName !== standing.leaderName && (
                            <span className="text-xs text-muted-foreground truncate">
                              {standing.deckName}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">--</span>
                    )}
                  </td>

                  {/* Record */}
                  <td className="px-3 py-3">
                    <span className="text-sm font-data text-foreground">
                      <span className="text-emerald-400">{standing.wins}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-red-400">{standing.losses}</span>
                      {standing.ties > 0 && (
                        <>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-blue-400">{standing.ties}</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Drop Round */}
                  <td className="px-3 py-3">
                    {standing.dropRound ? (
                      <span className="text-xs text-muted-foreground/70 bg-black/[0.04] dark:bg-white/[0.04] px-2 py-0.5 rounded">
                        R{standing.dropRound}
                      </span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
