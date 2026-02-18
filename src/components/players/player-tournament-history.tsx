"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { LeaderIcon } from "@/components/ui/leader-icon";
import { GlassCard } from "@/components/ui/glass-card";
import { Trophy } from "lucide-react";
import { format, parseISO } from "date-fns";

export interface PlayerTournamentRow {
  tournamentId: string;
  tournamentName: string;
  tournamentDate: string;
  playerCount: number | null;
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

interface PlayerTournamentHistoryProps {
  rows: PlayerTournamentRow[];
  player: string;
}

const placingStyles: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: "bg-amber-400/10", text: "text-amber-400", border: "border-l-amber-400" },
  2: { bg: "bg-slate-300/10", text: "text-slate-500 dark:text-slate-300", border: "border-l-slate-400 dark:border-l-slate-300" },
  3: { bg: "bg-amber-700/10", text: "text-amber-600", border: "border-l-amber-600" },
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

export function PlayerTournamentHistory({ rows, player }: PlayerTournamentHistoryProps) {
  if (rows.length === 0) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No tournament history available.
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
        <h3 className="text-lg font-semibold text-foreground">Tournament History</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                Date
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-3">
                Tournament
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-3">
                Leader
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-3 w-16">
                Place
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
            {rows.map((row) => {
              const placing = row.placing ?? 999;
              const rowStyle = placingStyles[placing];

              return (
                <tr
                  key={row.tournamentId}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]",
                    rowStyle && "border-l-2",
                    rowStyle?.border,
                    rowStyle?.bg
                  )}
                >
                  {/* Date */}
                  <td className="px-5 py-3">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(parseISO(row.tournamentDate), "MMM d, yyyy")}
                    </span>
                  </td>

                  {/* Tournament */}
                  <td className="px-3 py-3">
                    <Link
                      href={`/tournaments/${row.tournamentId}`}
                      className="text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {row.tournamentName}
                    </Link>
                    {row.playerCount && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({row.playerCount} players)
                      </span>
                    )}
                  </td>

                  {/* Leader */}
                  <td className="px-3 py-3">
                    {row.leaderName ? (
                      <div className="flex items-center gap-2">
                        {row.leaderSet && row.leaderNumber && (
                          <LeaderIcon
                            set={row.leaderSet}
                            number={row.leaderNumber}
                            name={row.leaderName}
                            size={32}
                          />
                        )}
                        <div className="flex flex-col min-w-0">
                          {row.deckId ? (
                            <Link
                              href={`/decklists/${row.tournamentId}/${player}`}
                              className="text-sm text-foreground hover:text-primary transition-colors truncate"
                            >
                              {row.leaderName}
                            </Link>
                          ) : (
                            <span className="text-sm text-foreground truncate">
                              {row.leaderName}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">--</span>
                    )}
                  </td>

                  {/* Placing */}
                  <td className="px-3 py-3">
                    <PlacingBadge placing={placing} />
                  </td>

                  {/* Record */}
                  <td className="px-3 py-3">
                    <span className="text-sm font-data text-foreground">
                      <span className="text-emerald-400">{row.wins}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-red-400">{row.losses}</span>
                      {row.ties > 0 && (
                        <>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-blue-400">{row.ties}</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Drop */}
                  <td className="px-3 py-3">
                    {row.dropRound ? (
                      <span className="text-xs text-muted-foreground/70 bg-black/[0.04] dark:bg-white/[0.04] px-2 py-0.5 rounded">
                        R{row.dropRound}
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
