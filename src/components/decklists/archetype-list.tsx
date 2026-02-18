"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ArrowDown, ArrowUpDown, Layers, ChevronDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { DecklistVisual } from "./decklist-visual";
import { CopyForSim } from "./copy-for-sim";
import type {
  GroupedDecklistWithCards,
  ArchetypePilot,
} from "@/lib/queries/decklists";

interface ArchetypeListProps {
  archetypes: GroupedDecklistWithCards[];
}

type SortKey = "games" | "winRate" | "pilots" | "placing";

const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: "games", label: "Games" },
  { key: "winRate", label: "Win Rate" },
  { key: "pilots", label: "Pilots" },
  { key: "placing", label: "Best Placing" },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function getRankColor(rank: number): string {
  if (rank === 1) return "text-warning";
  if (rank === 2) return "text-[var(--silver)]";
  if (rank === 3) return "text-[var(--bronze)]";
  return "text-muted-foreground";
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function totalGames(a: GroupedDecklistWithCards): number {
  return a.totalWins + a.totalLosses + a.totalTies;
}

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}


/** Group pilots by tournament for the history section */
function groupPilotsByTournament(
  pilots: ArchetypePilot[],
): Array<{
  tournamentId: string;
  tournamentName: string;
  tournamentDate: string;
  players: Array<{ player: string; displayName: string; placing: number | null }>;
}> {
  const map = new Map<
    string,
    {
      tournamentId: string;
      tournamentName: string;
      tournamentDate: string;
      players: Array<{ player: string; displayName: string; placing: number | null }>;
    }
  >();
  const order: string[] = [];

  for (const p of pilots) {
    if (!map.has(p.tournamentId)) {
      map.set(p.tournamentId, {
        tournamentId: p.tournamentId,
        tournamentName: p.tournamentName,
        tournamentDate: p.tournamentDate,
        players: [],
      });
      order.push(p.tournamentId);
    }
    map.get(p.tournamentId)!.players.push({
      player: p.player,
      displayName: p.displayName,
      placing: p.placing,
    });
  }

  // Sort players within each tournament by placing
  for (const group of map.values()) {
    group.players.sort(
      (a, b) => (a.placing ?? 999) - (b.placing ?? 999),
    );
  }

  return order.map((id) => map.get(id)!);
}

function ArchetypeCard({
  arch,
  rank,
}: {
  arch: GroupedDecklistWithCards;
  rank: number;
}) {
  const [showCards, setShowCards] = useState(false);
  const games = totalGames(arch);
  const tournamentGroups = useMemo(
    () => groupPilotsByTournament(arch.pilots),
    [arch.pilots],
  );

  const MAX_VISIBLE = 2;
  const [showAllHistory, setShowAllHistory] = useState(false);
  const allRows = useMemo(() => {
    const rows: Array<{
      tournamentId: string;
      tournamentName: string;
      tournamentDate: string;
      player: string;
      displayName: string;
      placing: number | null;
      isFirstInTournament: boolean;
    }> = [];
    for (const tg of tournamentGroups) {
      for (let i = 0; i < tg.players.length; i++) {
        rows.push({
          tournamentId: tg.tournamentId,
          tournamentName: tg.tournamentName,
          tournamentDate: tg.tournamentDate,
          ...tg.players[i],
          isFirstInTournament: i === 0,
        });
      }
    }
    return rows;
  }, [tournamentGroups]);

  const visibleRows = showAllHistory
    ? allRows
    : allRows.slice(0, MAX_VISIBLE);
  const hiddenCount = allRows.length - MAX_VISIBLE;

  return (
    <motion.div
      variants={item}
      className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer"
      onClick={() => setShowCards((v) => !v)}
    >
      {/* Accent line */}
      <div className="h-[2px] bg-gradient-to-r from-[var(--accent-line)] via-[var(--accent-line)] to-transparent" />

      <div className="p-4">
        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span
            className={`text-lg font-bold font-data ${getRankColor(rank)}`}
          >
            #{rank}
          </span>

          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Games
            </span>
            <span className="text-sm font-semibold font-data text-foreground">
              {games.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Win Rate
            </span>
            <span
              className={`text-sm font-semibold font-data ${arch.winRate >= 50 ? "text-success" : "text-error"}`}
            >
              {arch.winRate}%
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Pilots
            </span>
            <span className="text-sm font-semibold font-data text-foreground">
              {arch.pilotCount.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Best
            </span>
            <span className="text-sm font-semibold font-data text-foreground">
              {arch.bestPlacing ? ordinal(arch.bestPlacing) : "\u2014"}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
            <CopyForSim cards={arch.cards} />
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/50">
            {showCards ? "Hide cards" : "View cards"}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${showCards ? "rotate-180" : ""}`}
            />
          </span>
        </div>

        {/* Tournament history — hidden when cards are expanded */}
        {!showCards && allRows.length > 0 && (
          <div className="mt-3 border-l-2 border-[var(--accent-line)] pl-3 space-y-1" onClick={(e) => e.stopPropagation()}>
            {visibleRows.map((row) => (
              <div
                key={`${row.tournamentId}-${row.player}`}
                className="flex items-baseline gap-x-2 text-xs leading-relaxed"
              >
                {row.isFirstInTournament ? (
                  <>
                    <Link
                      href={`/tournaments/${encodeURIComponent(row.tournamentId)}`}
                      className="font-medium text-foreground hover:text-primary transition-colors shrink-0"
                    >
                      {row.tournamentName}
                    </Link>
                    <span className="text-muted-foreground/50 shrink-0 hidden sm:inline font-data">
                      {formatDate(row.tournamentDate)}
                    </span>
                    <span className="text-muted-foreground/30 shrink-0">
                      &mdash;
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground/20 shrink-0 pl-1">
                    &rdsh;
                  </span>
                )}
                <Link
                  href={`/decklists/${encodeURIComponent(row.tournamentId)}/${encodeURIComponent(row.player)}`}
                  className="text-muted-foreground hover:text-primary transition-colors truncate"
                >
                  {row.displayName}
                </Link>
                <span className="text-muted-foreground/50 font-data shrink-0">
                  {row.placing != null ? `#${row.placing}` : ""}
                </span>
              </div>
            ))}
            {!showAllHistory && hiddenCount > 0 && (
              <button
                onClick={() => setShowAllHistory(true)}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
              >
                + {hiddenCount} more
              </button>
            )}
          </div>
        )}

        {/* Expandable card images */}
        <AnimatePresence initial={false}>
          {showCards && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0.25,
                ease: [0.16, 1, 0.3, 1] as const,
              }}
              className="overflow-hidden"
            >
              <div className="pt-4">
                <DecklistVisual cards={arch.cards} compact />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function ArchetypeList({ archetypes }: ArchetypeListProps) {
  const [sortBy, setSortBy] = useState<SortKey>("games");

  const sorted = useMemo(() => {
    const copy = [...archetypes];
    switch (sortBy) {
      case "games":
        copy.sort((a, b) => totalGames(b) - totalGames(a));
        break;
      case "winRate":
        copy.sort(
          (a, b) => b.winRate - a.winRate || totalGames(b) - totalGames(a),
        );
        break;
      case "pilots":
        copy.sort((a, b) => b.pilotCount - a.pilotCount);
        break;
      case "placing":
        copy.sort(
          (a, b) => (a.bestPlacing ?? 999) - (b.bestPlacing ?? 999),
        );
        break;
    }
    return copy;
  }, [archetypes, sortBy]);

  const totalPilots = useMemo(
    () => archetypes.reduce((sum, a) => sum + a.pilotCount, 0),
    [archetypes],
  );

  const dataKey = useMemo(
    () =>
      archetypes
        .slice(0, 3)
        .map((a) => a.fingerprint)
        .join(",") +
      archetypes.length +
      sortBy,
    [archetypes, sortBy],
  );

  if (archetypes.length === 0) {
    return (
      <div className="glass rounded-xl flex flex-col items-center justify-center py-16 px-6 text-center">
        <Layers className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No archetypes found
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          No decklist data is available for this leader in the selected format.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Sort pills + summary */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mr-1 hidden sm:inline">
            Sort
          </span>
          {sortOptions.map((opt) => {
            const isActive = sortBy === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                }`}
              >
                {opt.label}
                {isActive ? (
                  <ArrowDown className="w-3 h-3" />
                ) : (
                  <ArrowUpDown className="w-3 h-3 opacity-30" />
                )}
              </button>
            );
          })}
        </div>

        {/* Summary */}
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <Layers className="w-4 h-4" />
          <span>
            {archetypes.length} archetype{archetypes.length !== 1 ? "s" : ""}{" "}
            &middot; {totalPilots.toLocaleString()} pilots
          </span>
        </div>
      </div>

      {/* Archetype cards */}
      <motion.div
        key={dataKey}
        variants={container}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {sorted.map((arch, index) => (
          <ArchetypeCard
            key={arch.fingerprint}
            arch={arch}
            rank={index + 1}
          />
        ))}
      </motion.div>
    </div>
  );
}
