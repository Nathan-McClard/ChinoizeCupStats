"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { LeaderIcon, getLeaderImageUrl } from "@/components/ui/leader-icon";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import {
  Trophy,
  Users,
  Calendar,
  Swords,
  Crown,
  Layers,
} from "lucide-react";
import { format, parseISO } from "date-fns";

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

interface TournamentHeroProps {
  tournament: {
    id: string;
    name: string;
    date: string;
    playerCount: number;
    format: string | null;
    roundCount: number;
  };
  winner: Standing | null;
  topCut: Standing[];
  totalGames: number;
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

export function TournamentHero({
  tournament,
  winner,
  topCut,
  totalGames,
}: TournamentHeroProps) {
  const winnerImageUrl =
    winner?.leaderSet && winner?.leaderNumber
      ? getLeaderImageUrl(winner.leaderSet, winner.leaderNumber)
      : null;

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
        {/* Winner card art background */}
        {winnerImageUrl && (
          <div className="pointer-events-none absolute inset-0">
            <Image
              src={winnerImageUrl}
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
        )}

        <div className="relative p-6 sm:p-8 flex flex-col justify-between h-full min-h-[240px]">
          {/* Top: Event label + date */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-3.5 h-3.5 text-[#ff9f0a]" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
                Tournament
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-foreground leading-tight">
              {tournament.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              <span className="text-sm text-muted-foreground">
                {format(parseISO(tournament.date), "MMMM d, yyyy")}
              </span>
              {tournament.format && (
                <>
                  <span className="text-muted-foreground/30">&middot;</span>
                  <span className="text-sm text-muted-foreground">
                    {tournament.format}
                  </span>
                </>
              )}
              {tournament.roundCount > 0 && (
                <>
                  <span className="text-muted-foreground/30">&middot;</span>
                  <span className="text-sm text-muted-foreground">
                    {tournament.roundCount} rounds
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Bottom: Winner spotlight */}
          {winner && (
            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-3">
                {winner.leaderSet && winner.leaderNumber ? (
                  <LeaderIcon
                    set={winner.leaderSet}
                    number={winner.leaderNumber}
                    name={winner.leaderName ?? undefined}
                    size={48}
                    className="rounded-xl shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#ff9f0a]/10 flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5 text-[#ff9f0a]" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-3 h-3 text-[#ff9f0a]" />
                    <span className="text-[10px] font-semibold text-[#ff9f0a] uppercase tracking-wider">
                      Champion
                    </span>
                  </div>
                  <p className="text-base font-semibold text-foreground truncate">
                    {winner.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {winner.leaderName}
                    <span className="text-muted-foreground/40 mx-1">&middot;</span>
                    <span className="text-emerald-400">{winner.wins}W</span>
                    {" - "}
                    <span className="text-red-400">{winner.losses}L</span>
                    {winner.ties > 0 && (
                      <>
                        {" - "}
                        <span className="text-blue-400">{winner.ties}T</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Stat cells ── */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-card border border-border p-4 sm:p-5 flex flex-col justify-between min-h-[110px]"
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(to right, transparent, var(--accent-line), transparent)",
          }}
        />
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Players
          </span>
        </div>
        <AnimatedCounter
          value={tournament.playerCount}
          duration={2}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-data tracking-tight"
        />
      </motion.div>

      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-card border border-border p-4 sm:p-5 flex flex-col justify-between min-h-[110px]"
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(to right, transparent, #30d15850, transparent)",
          }}
        />
        <div className="flex items-center gap-1.5">
          <Swords className="w-3.5 h-3.5 text-[#30d158]" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Games
          </span>
        </div>
        <AnimatedCounter
          value={totalGames}
          duration={2}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-data tracking-tight"
        />
      </motion.div>

      {/* ── Top Cut showcase ── */}
      <motion.div
        variants={item}
        className="col-span-2 relative overflow-hidden rounded-2xl bg-card border border-border p-4 sm:p-5"
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(to right, transparent, #ff9f0a50, transparent)",
          }}
        />
        <div className="flex items-center gap-1.5 mb-3">
          <Layers className="w-3.5 h-3.5 text-[#ff9f0a]" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Top 8
          </span>
        </div>

        {topCut.length > 0 ? (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1">
            {topCut.map((s, i) => (
              <Link
                key={`${s.tournamentId}-${s.player}`}
                href={
                  s.deckId
                    ? `/decklists/${s.tournamentId}/${s.player}`
                    : `/players/${s.player}`
                }
                className="flex flex-col items-center gap-1.5 shrink-0 group"
              >
                <div className="relative">
                  {s.leaderSet && s.leaderNumber ? (
                    <LeaderIcon
                      set={s.leaderSet}
                      number={s.leaderNumber}
                      name={s.leaderName ?? undefined}
                      size={44}
                      className="rounded-xl group-hover:ring-2 ring-primary/40 transition-all"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-black/[0.06] dark:bg-white/[0.06] flex items-center justify-center">
                      <span className="text-xs font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                    </div>
                  )}
                  {i === 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff9f0a] flex items-center justify-center">
                      <Crown className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-center max-w-[64px]">
                  <p className="text-[10px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {s.displayName}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No top cut data available</p>
        )}
      </motion.div>
    </motion.div>
  );
}
