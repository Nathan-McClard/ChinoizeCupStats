"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { SearchX, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { LeaderIcon } from "@/components/ui/leader-icon";
import type { DecklistEntry } from "@/lib/queries/decklists";

interface DecklistListProps {
  decklists: DecklistEntry[];
  grouped: boolean;
  hasActiveFilters: boolean;
}

interface TournamentGroup {
  tournamentId: string;
  tournamentName: string;
  tournamentDate: string;
  entries: DecklistEntry[];
}

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.02 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function DecklistList({
  decklists,
  grouped,
  hasActiveFilters,
}: DecklistListProps) {
  // Stable key for re-triggering animations on data change
  const dataKey = useMemo(
    () =>
      decklists
        .slice(0, 5)
        .map((d) => `${d.tournamentId}-${d.player}`)
        .join(",") + decklists.length,
    [decklists],
  );

  // Group decklists by tournament (preserving order from query)
  const groups = useMemo(() => {
    if (!grouped) return null;
    const map = new Map<string, TournamentGroup>();
    const order: string[] = [];
    for (const entry of decklists) {
      if (!map.has(entry.tournamentId)) {
        map.set(entry.tournamentId, {
          tournamentId: entry.tournamentId,
          tournamentName: entry.tournamentName,
          tournamentDate: entry.tournamentDate,
          entries: [],
        });
        order.push(entry.tournamentId);
      }
      map.get(entry.tournamentId)!.entries.push(entry);
    }
    return order.map((id) => map.get(id)!);
  }, [decklists, grouped]);

  if (decklists.length === 0) {
    return (
      <div className="glass rounded-xl flex flex-col items-center justify-center py-16 px-6 text-center">
        <SearchX className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No decklists found
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {hasActiveFilters
            ? "Try adjusting your filters to broaden the search results."
            : "No decklist data is available yet. Sync tournament data to populate this page."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <FileText className="w-4 h-4" />
        <span>
          {decklists.length}
          {decklists.length === 500 ? "+" : ""} decklist
          {decklists.length !== 1 ? "s" : ""}
          {hasActiveFilters && " (filtered)"}
        </span>
      </div>

      <motion.div
        key={dataKey}
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {groups
          ? groups.map((group) => (
              <div key={group.tournamentId} className="mb-6 last:mb-0">
                {/* Tournament header */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-px flex-1 bg-border/40" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    {group.tournamentName}
                  </span>
                  <span className="text-[11px] text-muted-foreground/50 font-data whitespace-nowrap">
                    {formatDate(group.tournamentDate)}
                  </span>
                  <div className="h-px flex-1 bg-border/40" />
                </div>
                <div className="space-y-0.5">
                  {group.entries.map((entry) => (
                    <DecklistRow key={`${entry.tournamentId}-${entry.player}`} entry={entry} showTournament={false} />
                  ))}
                </div>
              </div>
            ))
          : (
            <div className="space-y-0.5">
              {decklists.map((entry) => (
                <DecklistRow key={`${entry.tournamentId}-${entry.player}`} entry={entry} showTournament />
              ))}
            </div>
          )}
      </motion.div>
    </div>
  );
}

function DecklistRow({
  entry,
  showTournament,
}: {
  entry: DecklistEntry;
  showTournament: boolean;
}) {
  return (
    <motion.div variants={item}>
      <Link
        href={`/decklists/${encodeURIComponent(entry.tournamentId)}/${encodeURIComponent(entry.player)}`}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors group"
      >
        {/* Leader icon */}
        <LeaderIcon
          set={entry.leaderSet || ""}
          number={entry.leaderNumber || ""}
          name={entry.leaderName ?? undefined}
          size={36}
          className="shrink-0"
        />

        {/* Placing */}
        <span className="font-data text-sm text-muted-foreground w-8 text-right shrink-0">
          #{entry.placing ?? "—"}
        </span>

        {/* Player + Leader name */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {entry.displayName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {entry.leaderName || "Unknown Leader"}
          </p>
        </div>

        {/* Record */}
        <span className="flex items-center gap-0.5 text-xs font-data shrink-0">
          <span className="text-success">{entry.wins}W</span>
          <span className="text-muted-foreground">-</span>
          <span className="text-error">{entry.losses}L</span>
          {entry.ties > 0 && (
            <>
              <span className="text-muted-foreground">-</span>
              <span className="text-warning">{entry.ties}T</span>
            </>
          )}
        </span>

        {/* Tournament + Date (flat mode) */}
        {showTournament && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 max-w-[220px]">
            <span className="truncate">{entry.tournamentName}</span>
            <span className="text-muted-foreground/30">|</span>
            <span className="whitespace-nowrap">
              {formatDate(entry.tournamentDate)}
            </span>
          </span>
        )}
      </Link>
    </motion.div>
  );
}
