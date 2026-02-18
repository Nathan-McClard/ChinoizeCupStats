"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import { parseDeckId, getLeaderImageUrl } from "@/components/ui/leader-icon";
import type { LeaderStats, MatchupMatrix } from "@/lib/queries/leaders";

interface MatchupChartProps {
  matrix: MatchupMatrix;
  leaders: LeaderStats[];
  currentDeckId: string;
}

/* ── Color helpers ── */

function getCellBg(winRate: number): string {
  const deviation = winRate - 0.5;

  if (deviation >= 0) {
    const intensity = Math.min(deviation / 0.15, 1);
    const alpha = 0.1 + intensity * 0.5;
    return `rgba(48, 209, 88, ${alpha.toFixed(2)})`;
  } else {
    const intensity = Math.min(Math.abs(deviation) / 0.15, 1);
    const alpha = 0.1 + intensity * 0.5;
    return `rgba(255, 69, 58, ${alpha.toFixed(2)})`;
  }
}

function getCellText(winRate: number): string {
  const deviation = Math.abs(winRate - 0.5);
  if (deviation > 0.12) return "rgba(255,255,255,0.95)";
  return "var(--foreground)";
}

/* ── Matchup cell ── */

function MatchupCell({
  opponent,
  cell,
  currentLeaderName,
  onHover,
  onLeave,
}: {
  opponent: LeaderStats;
  cell: { wins: number; losses: number; ties: number; total: number; winRate: number } | null;
  currentLeaderName: string;
  onHover: (e: React.MouseEvent, opponent: LeaderStats) => void;
  onLeave: () => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const parsed = parseDeckId(opponent.deckId);
  const hasImage = parsed && !imgErr;

  const isEmpty = !cell || cell.total === 0;
  const pct = cell ? cell.winRate * 100 : 0;

  return (
    <div
      className="group flex flex-col items-center gap-1.5"
      onMouseMove={(e) => onHover(e, opponent)}
      onMouseLeave={onLeave}
    >
      {/* Leader image */}
      <div className="relative w-[52px] h-[52px] rounded-xl overflow-hidden bg-muted/50 shrink-0">
        {hasImage ? (
          <Image
            src={getLeaderImageUrl(parsed.set, parsed.number)}
            alt={opponent.leaderName}
            fill
            className="object-cover object-top"
            onError={() => setImgErr(true)}
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <span className="text-[9px] font-bold text-muted-foreground">
              {opponent.leaderName.slice(0, 3)}
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <span className="text-[9px] font-medium text-foreground leading-tight text-center w-[76px] truncate">
        {opponent.leaderName}
      </span>

      {/* Win rate cell */}
      <div
        className="w-[76px] h-[44px] rounded-lg flex flex-col items-center justify-center cursor-default transition-all duration-150 group-hover:scale-105 group-hover:shadow-lg"
        style={{
          background: isEmpty ? "var(--input)" : getCellBg(cell!.winRate),
        }}
      >
        {isEmpty ? (
          <span className="text-[10px] text-muted-foreground/40 font-data">—</span>
        ) : (
          <>
            <span
              className="text-sm font-bold font-data leading-tight"
              style={{ color: getCellText(cell!.winRate) }}
            >
              {pct.toFixed(1)}%
            </span>
            <span
              className="text-[9px] font-data leading-tight"
              style={{ color: getCellText(cell!.winRate), opacity: 0.6 }}
            >
              {cell!.total}g
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Tooltip ── */

function CellTooltip({
  cell,
  currentName,
  opponentName,
  position,
}: {
  cell: { wins: number; losses: number; ties: number; total: number; winRate: number };
  currentName: string;
  opponentName: string;
  position: { x: number; y: number };
}) {
  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left: position.x, top: position.y, transform: "translate(-50%, -110%)" }}
    >
      <div className="bg-popover border border-border rounded-xl px-3 py-2 shadow-xl text-xs">
        <p className="font-semibold text-foreground mb-1">
          {currentName} vs {opponentName}
        </p>
        <div className="flex items-center gap-3 font-data">
          <span>
            <span className="text-success">{cell.wins}W</span>
            {" - "}
            <span className="text-error">{cell.losses}L</span>
            {cell.ties > 0 && (
              <>
                {" - "}
                <span className="text-warning">{cell.ties}T</span>
              </>
            )}
          </span>
          <span className="text-muted-foreground">{cell.total} games</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */

const blurIn = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function MatchupChart({ matrix, leaders, currentDeckId }: MatchupChartProps) {
  const [expanded, setExpanded] = useState(false);
  const [tooltip, setTooltip] = useState<{
    cell: { wins: number; losses: number; ties: number; total: number; winRate: number };
    opponentName: string;
    position: { x: number; y: number };
  } | null>(null);

  // Current leader info
  const currentLeader = leaders.find((l) => l.deckId === currentDeckId);
  const currentName = currentLeader?.leaderName ?? "Unknown";
  const currentMatchups = matrix[currentDeckId] ?? {};

  // Opponents: sorted by most games played against (descending)
  const opponents = leaders
    .filter((l) => l.deckId !== currentDeckId)
    .sort((a, b) => {
      const aGames = currentMatchups[a.deckId]?.total ?? 0;
      const bGames = currentMatchups[b.deckId]?.total ?? 0;
      return bGames - aGames;
    });

  const handleHover = (e: React.MouseEvent, opponent: LeaderStats) => {
    const cell = currentMatchups[opponent.deckId];
    if (!cell || cell.total === 0) {
      setTooltip(null);
      return;
    }
    setTooltip({
      cell,
      opponentName: opponent.leaderName,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  if (opponents.length === 0) {
    return (
      <motion.div
        variants={blurIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="relative overflow-hidden rounded-2xl bg-card border border-border p-6"
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--accent-line), transparent)",
          }}
        />
        <div className="flex items-center gap-2 mb-4">
          <Swords className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Matchups</h3>
        </div>
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
          No matchup data available
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={blurIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="relative overflow-hidden rounded-2xl bg-card border border-border p-6"
      onMouseLeave={() => setTooltip(null)}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--accent-line), transparent)",
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Swords className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Matchups
        </h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {opponents.length} opponents
        </span>
      </div>

      {/* Grid: one row clipped when collapsed, full grid when expanded */}
      <div className={expanded ? "" : "overflow-hidden max-h-[130px]"}>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3 justify-items-center">
          {opponents.map((opp) => (
            <MatchupCell
              key={opp.deckId}
              opponent={opp}
              cell={currentMatchups[opp.deckId] ?? null}
              currentLeaderName={currentName}
              onHover={handleHover}
              onLeave={() => setTooltip(null)}
            />
          ))}
        </div>
      </div>

      {/* Expand / collapse toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors mx-auto py-2 px-4 rounded-lg hover:bg-primary/5"
      >
        {expanded ? "Show Less" : `Show All ${opponents.length} Matchups`}
      </button>

      {/* Tooltip */}
      {tooltip && (
        <CellTooltip
          cell={tooltip.cell}
          currentName={currentName}
          opponentName={tooltip.opponentName}
          position={tooltip.position}
        />
      )}
    </motion.div>
  );
}
