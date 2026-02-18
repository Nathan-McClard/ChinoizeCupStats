"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Trophy,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { getLeaderImageUrl, parseDeckId } from "@/components/ui/leader-icon";
import type { LeaderStats } from "@/lib/queries/leaders";

type SortKey =
  | "rank"
  | "winRate"
  | "top4Rate"
  | "playRate"
  | "totalEntries"
  | "tournamentWins";
type SortDir = "asc" | "desc";

interface LeaderRankingsProps {
  leaders: LeaderStats[];
}

interface MatchupEntry {
  opponentDeckId: string;
  opponentName: string;
  wins: number;
  losses: number;
  ties: number;
  total: number;
  winRate: number;
}

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "rank", label: "Rank" },
  { key: "winRate", label: "Win Rate" },
  { key: "top4Rate", label: "Top 4%" },
  { key: "playRate", label: "Play Rate" },
  { key: "totalEntries", label: "Entries" },
  { key: "tournamentWins", label: "Wins" },
];

function getWinRateColor(winRate: number): string {
  if (winRate > 0.55) return "var(--success)";
  if (winRate >= 0.48) return "var(--primary)";
  if (winRate >= 0.42) return "var(--warning)";
  return "var(--error)";
}

function getMatchupBg(winRate: number): string {
  const deviation = winRate - 0.5;
  if (deviation >= 0) {
    const intensity = Math.min(deviation / 0.15, 1);
    return `rgba(48, 209, 88, ${(0.1 + intensity * 0.5).toFixed(2)})`;
  } else {
    const intensity = Math.min(Math.abs(deviation) / 0.15, 1);
    return `rgba(255, 69, 58, ${(0.1 + intensity * 0.5).toFixed(2)})`;
  }
}

function getMatchupText(winRate: number): string {
  const deviation = Math.abs(winRate - 0.5);
  if (deviation > 0.12) return "rgba(255,255,255,0.95)";
  return "var(--foreground)";
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function LeaderRankings({ leaders }: LeaderRankingsProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showUnranked, setShowUnranked] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Stable key that changes when the dataset changes (format switch),
  // forcing the motion container to remount and re-trigger animations.
  const dataKey = useMemo(
    () => leaders.map((l) => l.deckId).slice(0, 5).join(",") + leaders.length,
    [leaders],
  );

  // Reset expanded drawer when format changes
  useEffect(() => {
    setExpandedId(null);
  }, [dataKey]);

  const qualified = useMemo(
    () => leaders.filter((l) => l.totalEntries >= 5),
    [leaders],
  );
  const unranked = useMemo(
    () => leaders.filter((l) => l.totalEntries < 5),
    [leaders],
  );

  const rankedLeaders = useMemo(() => {
    return qualified.map((leader, i) => ({ ...leader, rank: i + 1 }));
  }, [qualified]);

  const sorted = useMemo(() => {
    const arr = [...rankedLeaders];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "rank":
          cmp = a.rank - b.rank;
          break;
        case "winRate":
          cmp = a.winRate - b.winRate;
          break;
        case "top4Rate":
          cmp = a.top4Rate - b.top4Rate;
          break;
        case "playRate":
          cmp = a.playRate - b.playRate;
          break;
        case "totalEntries":
          cmp = a.totalEntries - b.totalEntries;
          break;
        case "tournamentWins":
          cmp = a.tournamentWins - b.tournamentWins;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [rankedLeaders, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "rank" ? "asc" : "desc");
    }
  }

  const toggleExpanded = useCallback((deckId: string) => {
    setExpandedId((prev) => (prev === deckId ? null : deckId));
  }, []);

  return (
    <div>
      {/* Sort toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mr-1">
          Sort by
        </span>
        {sortOptions.map((opt) => {
          const isActive = sortKey === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => handleSort(opt.key)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
              }`}
            >
              {opt.label}
              {isActive ? (
                sortDir === "asc" ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )
              ) : (
                <ArrowUpDown className="w-3 h-3 opacity-30" />
              )}
            </button>
          );
        })}
      </div>

      {/* Leader cards */}
      <motion.div
        key={dataKey}
        className="space-y-2"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {sorted.map((leader) => (
          <LeaderCard
            key={leader.deckId}
            leader={leader}
            rank={leader.rank}
            expanded={expandedId === leader.deckId}
            onToggle={toggleExpanded}
          />
        ))}
      </motion.div>

      {/* Unranked section */}
      {unranked.length > 0 && (
        <div className="mt-10">
          <button
            onClick={() => setShowUnranked((o) => !o)}
            className="flex items-center gap-3 w-full cursor-pointer group"
          >
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-[0.15em]">
              Unranked (&lt; 5 entries)
            </span>
            <span className="text-[10px] text-muted-foreground/30 font-data">
              {unranked.length}
            </span>
            <ChevronDown
              className={`w-3 h-3 text-muted-foreground/30 transition-transform duration-300 ${showUnranked ? "rotate-180" : ""}`}
            />
            <div className="h-px flex-1 bg-border/40" />
          </button>

          {showUnranked && (
            <div className="space-y-2 mt-4">
              {unranked.map((leader) => (
                <LeaderCard
                  key={leader.deckId}
                  leader={leader}
                  rank={null}
                  muted
                  expanded={expandedId === leader.deckId}
                  onToggle={toggleExpanded}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LeaderCard({
  leader,
  rank,
  muted,
  expanded,
  onToggle,
}: {
  leader: LeaderStats & { rank?: number };
  rank: number | null;
  muted?: boolean;
  expanded: boolean;
  onToggle: (deckId: string) => void;
}) {
  const imageUrl = getLeaderImageUrl(leader.leaderSet, leader.leaderNumber);
  const barColor = getWinRateColor(leader.winRate);

  return (
    <motion.div variants={item}>
      <div
        className={`relative overflow-hidden rounded-2xl bg-card border transition-all duration-300 ${
          expanded
            ? "border-primary/30 shadow-lg shadow-black/[0.05] dark:shadow-black/[0.2]"
            : "border-border hover:border-border/80 dark:hover:border-white/[0.12]"
        } ${muted ? "opacity-60 hover:opacity-90" : ""}`}
      >
        {/* Clickable card row */}
        <button
          onClick={() => onToggle(leader.deckId)}
          className="w-full text-left cursor-pointer group"
        >
          {/* Desktop grid */}
          <div
            className="hidden md:grid items-center px-4 py-3 gap-x-5"
            style={{
              gridTemplateColumns:
                "2rem 4rem 1fr 5.5rem 4.5rem 4.5rem 4rem 5.5rem",
            }}
          >
            <span className="font-data font-black text-base text-muted-foreground text-center">
              {rank ?? "—"}
            </span>

            <div className="relative w-16 h-16 rounded-xl overflow-hidden ring-1 ring-border/50">
              <Image
                src={imageUrl}
                alt={leader.leaderName}
                fill
                className="object-cover object-[center_15%] transition-transform duration-500 group-hover:scale-110"
                unoptimized
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {leader.leaderName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-muted-foreground font-data">
                  {leader.deckId}
                </span>
                {leader.tournamentWins > 0 && (
                  <span className="inline-flex items-center gap-0.5">
                    <Trophy className="w-3 h-3 text-warning" />
                    <span className="text-[10px] font-bold text-warning font-data">
                      {leader.tournamentWins}
                    </span>
                  </span>
                )}
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.04] overflow-hidden max-w-64">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(leader.winRate * 100, 100)}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
            </div>

            <div className="text-right">
              <span
                className="font-data font-black text-xl leading-none"
                style={{ color: barColor }}
              >
                <AnimatedCounter
                  value={leader.winRate * 100}
                  decimals={1}
                  suffix="%"
                />
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Win Rate
              </p>
            </div>

            <div className="text-right">
              <span className="font-data font-semibold text-sm text-foreground">
                <AnimatedCounter
                  value={leader.top4Rate * 100}
                  decimals={1}
                  suffix="%"
                />
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Top 4</p>
            </div>

            <div className="text-right">
              <span className="font-data font-semibold text-sm text-foreground">
                <AnimatedCounter
                  value={leader.playRate * 100}
                  decimals={1}
                  suffix="%"
                />
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Play Rate
              </p>
            </div>

            <div className="text-right">
              <span className="font-data font-semibold text-sm text-foreground">
                <AnimatedCounter value={leader.totalEntries} decimals={0} />
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Entries
              </p>
            </div>

            <div className="text-right">
              <span className="font-data font-semibold text-sm text-foreground">
                {leader.totalWins}-{leader.totalLosses}-{leader.totalTies}
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Record</p>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="flex md:hidden items-center gap-3 px-3 py-3">
            <span className="font-data font-black text-base text-muted-foreground w-7 text-center flex-shrink-0">
              {rank ?? "—"}
            </span>
            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-border/50">
              <Image
                src={imageUrl}
                alt={leader.leaderName}
                fill
                className="object-cover object-[center_15%]"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground truncate">
                {leader.leaderName}
              </h3>
              <span className="text-[11px] text-muted-foreground font-data">
                {leader.deckId}
              </span>
            </div>
            <div className="flex-shrink-0 text-right">
              <span
                className="font-data font-black text-lg leading-none"
                style={{ color: barColor }}
              >
                <AnimatedCounter
                  value={leader.winRate * 100}
                  decimals={1}
                  suffix="%"
                />
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">WR</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <InlineStat
                label="T4"
                value={leader.top4Rate * 100}
                suffix="%"
                decimals={1}
              />
              <InlineStat
                label="Ent"
                value={leader.totalEntries}
                decimals={0}
              />
            </div>
          </div>
        </button>

        {/* Expandable drawer */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1] as const,
              }}
              className="overflow-hidden"
            >
              <LeaderDrawer leader={leader} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Drawer content ── */

function LeaderDrawer({ leader }: { leader: LeaderStats }) {
  const [matchups, setMatchups] = useState<MatchupEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/leaders/${leader.deckId}/matchups`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setMatchups(data.matchups ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMatchups([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [leader.deckId]);

  const topMatchups = matchups?.slice(0, 8) ?? [];

  return (
    <div className="border-t border-border/50 px-4 py-4 sm:px-5 sm:py-5">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5">
        {/* Matchups */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            </div>
          ) : topMatchups.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No matchup data available
            </p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {topMatchups.map((m) => (
                <MatchupCell key={m.opponentDeckId} matchup={m} />
              ))}
            </div>
          )}
        </div>

        {/* Quick stats + link */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 lg:gap-2 lg:justify-between">
          <div className="flex items-center gap-3">
            <QuickStat
              label="Conversion"
              value={`${(leader.conversionRate * 100).toFixed(1)}%`}
            />
            <QuickStat label="Avg Place" value={leader.avgPlacing.toFixed(1)} />
          </div>
          <Link
            href={`/leaders/${leader.deckId}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/15 transition-colors"
          >
            View Full Data
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Matchup cell ── */

function MatchupCell({ matchup }: { matchup: MatchupEntry }) {
  const parsed = parseDeckId(matchup.opponentDeckId);
  const imageUrl = parsed ? getLeaderImageUrl(parsed.set, parsed.number) : null;
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Opponent image */}
      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted/50">
        {imageUrl && !imgErr ? (
          <Image
            src={imageUrl}
            alt={matchup.opponentName}
            fill
            className="object-cover object-top"
            onError={() => setImgErr(true)}
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <span className="text-[8px] font-bold text-muted-foreground">
              {matchup.opponentName.slice(0, 3)}
            </span>
          </div>
        )}
      </div>
      {/* Name */}
      <span className="text-[9px] font-medium text-foreground leading-tight text-center w-full truncate">
        {matchup.opponentName}
      </span>
      {/* WR cell */}
      <div
        className="w-full h-8 rounded-lg flex flex-col items-center justify-center"
        style={{ background: getMatchupBg(matchup.winRate) }}
      >
        <span
          className="text-[11px] font-bold font-data leading-none"
          style={{ color: getMatchupText(matchup.winRate) }}
        >
          {(matchup.winRate * 100).toFixed(0)}%
        </span>
        <span
          className="text-[8px] font-data leading-none mt-0.5"
          style={{ color: getMatchupText(matchup.winRate), opacity: 0.6 }}
        >
          {matchup.total}g
        </span>
      </div>
    </div>
  );
}

/* ── Small helpers ── */

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
      <span className="text-xs font-semibold font-data text-foreground leading-tight">
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground leading-tight">
        {label}
      </span>
    </div>
  );
}

function InlineStat({
  label,
  value,
  suffix = "",
  decimals = 1,
}: {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <div className="flex flex-col items-center px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] min-w-[52px]">
      <span className="text-xs font-semibold font-data text-foreground leading-tight">
        <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
      </span>
      <span className="text-[10px] text-muted-foreground leading-tight">
        {label}
      </span>
    </div>
  );
}
