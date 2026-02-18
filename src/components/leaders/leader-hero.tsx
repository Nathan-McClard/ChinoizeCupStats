"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getLeaderImageUrl } from "@/components/ui/leader-icon";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Target, Medal, Trophy, TrendingUp } from "lucide-react";

interface LeaderHeroProps {
  leaderName: string;
  deckId: string;
  leaderSet: string;
  leaderNumber: string;
  rank: number | null;
  winRate: number;
  top4Rate: number;
  tournamentWins: number;
  avgPlacing: number;
  totalEntries: number;
  totalWins: number;
  totalLosses: number;
  totalTies: number;
  playRate: number;
  compositeScore: number;
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function LeaderHero({
  leaderName,
  deckId,
  leaderSet,
  leaderNumber,
  rank,
  winRate,
  top4Rate,
  tournamentWins,
  avgPlacing,
  totalEntries,
  totalWins,
  totalLosses,
  totalTies,
}: LeaderHeroProps) {
  const imageUrl = getLeaderImageUrl(leaderSet, leaderNumber);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
    >
      {/* ── Main hero cell ── */}
      <motion.div
        variants={item}
        className="col-span-2 lg:row-span-2 relative overflow-hidden rounded-2xl bg-card border border-border"
      >
        {/* Card art background */}
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover object-top opacity-[0.10] dark:opacity-[0.08]"
            style={{
              maskImage:
                "linear-gradient(to bottom, black 30%, transparent 90%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 30%, transparent 90%)",
            }}
            unoptimized
          />
        </div>

        {/* Ambient accent orbs */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-[0.12]"
          style={{
            backgroundColor: "var(--primary)",
            animation: "hero-float 12s ease-in-out infinite",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-[60px] opacity-[0.08]"
          style={{
            backgroundColor: "var(--primary)",
            animation: "hero-float-alt 14s ease-in-out infinite",
          }}
        />

        <div className="relative p-6 sm:p-8 flex flex-col justify-between h-full min-h-[240px]">
          {/* Top: Leader label */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
                Leader
              </span>
            </div>

            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-foreground leading-tight">
                {leaderName}
              </h1>
              {rank && (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-sm font-bold font-data border border-primary/20">
                  #{rank}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground">{deckId}</p>
          </div>

          {/* Bottom: Overall record */}
          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Overall Record
                </p>
                <p className="text-lg font-bold text-foreground font-data">
                  <span className="text-success">{totalWins}W</span>
                  <span className="text-muted-foreground mx-1">-</span>
                  <span className="text-error">{totalLosses}L</span>
                  {totalTies > 0 && (
                    <>
                      <span className="text-muted-foreground mx-1">-</span>
                      <span className="text-warning">{totalTies}T</span>
                    </>
                  )}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Entries
                </p>
                <p className="text-lg font-bold text-foreground font-data">
                  {totalEntries}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stat cells ── */}

      {/* Win Rate */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-card border border-border p-4 sm:p-5 flex flex-col justify-between min-h-[110px]"
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--accent-line), transparent)",
          }}
        />
        <div className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Win Rate
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <AnimatedCounter
            value={winRate * 100}
            decimals={1}
            duration={2}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-data tracking-tight"
          />
          <span className="text-lg font-bold text-muted-foreground font-data">
            %
          </span>
        </div>
      </motion.div>

      {/* Top 4 Rate */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-card border border-border p-4 sm:p-5 flex flex-col justify-between min-h-[110px]"
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--accent-line), transparent)",
          }}
        />
        <div className="flex items-center gap-1.5">
          <Medal className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Top 4 Rate
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <AnimatedCounter
            value={top4Rate * 100}
            decimals={1}
            duration={2}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-data tracking-tight"
          />
          <span className="text-lg font-bold text-muted-foreground font-data">
            %
          </span>
        </div>
      </motion.div>

      {/* Tournament Wins */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-card border border-border p-4 sm:p-5 flex flex-col justify-between min-h-[110px]"
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--accent-line), transparent)",
          }}
        />
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Wins
          </span>
        </div>
        <AnimatedCounter
          value={tournamentWins}
          duration={2}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-data tracking-tight"
        />
      </motion.div>

      {/* Avg Placing */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-card border border-border p-4 sm:p-5 flex flex-col justify-between min-h-[110px]"
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--accent-line), transparent)",
          }}
        />
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Avg Placing
          </span>
        </div>
        <AnimatedCounter
          value={avgPlacing}
          decimals={1}
          duration={2}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-data tracking-tight"
        />
      </motion.div>
    </motion.div>
  );
}
