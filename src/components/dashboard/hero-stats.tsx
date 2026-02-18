"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { LeaderIcon } from "@/components/ui/leader-icon";
import { Trophy, Users, Swords, Crown, ArrowRight } from "lucide-react";

interface HeroStatsProps {
  totalTournaments: number;
  uniquePlayers: number;
  uniqueLeaders: number;
  formatName?: string | null;
  latestTournament?: {
    id: string;
    name: string;
    date: string;
    playerCount: number;
    winner?: {
      displayName: string;
      deckId: string | null;
      leaderName: string | null;
      leaderSet: string | null;
      leaderNumber: string | null;
    } | null;
  } | null;
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function HeroStats({
  totalTournaments,
  uniquePlayers,
  uniqueLeaders,
  formatName,
  latestTournament,
}: HeroStatsProps) {
  const stats = [
    { label: "Events", value: totalTournaments, icon: Trophy },
    { label: "Players", value: uniquePlayers, icon: Users },
    { label: "Leaders", value: uniqueLeaders, icon: Swords },
  ];

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
    >
      {/* ── Hero Cell ── */}
      <motion.div
        variants={item}
        className="col-span-2 lg:row-span-2 relative overflow-hidden rounded-2xl bg-card border border-border"
      >
        {/* Luffy illustration — masked into right side */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          <Image
            src="/images/luffy.webp"
            alt=""
            fill
            className="object-cover object-[center_20%] opacity-[0.12] dark:opacity-[0.10]"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 20%, black 55%, black 80%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 20%, black 55%, black 80%, transparent 100%)",
            }}
            unoptimized
            priority
          />
        </div>

        {/* Ambient gradient orbs */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-[320px] h-[320px] rounded-full bg-primary/[0.06] dark:bg-primary/[0.10] blur-[100px]"
          style={{ animation: "hero-float 20s ease-in-out infinite" }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 w-[250px] h-[250px] rounded-full bg-primary/[0.04] dark:bg-primary/[0.07] blur-[80px]"
          style={{ animation: "hero-float-alt 25s ease-in-out infinite" }}
        />
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full bg-primary/[0.03] dark:bg-primary/[0.05] blur-[60px]"
          style={{ animation: "hero-float 30s ease-in-out infinite reverse" }}
        />

        <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col justify-center h-full min-h-[220px]">
          {/* Live indicator */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex items-center justify-center h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full rounded-full bg-success"
                style={{
                  animation:
                    "pulse-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                }}
              />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
              One Piece TCG Analytics
            </span>
            {formatName && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                {formatName} Meta
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-foreground leading-tight">
            ChinoizeStats
          </h1>

          <p className="mt-2 sm:mt-3 text-sm text-muted-foreground/70 max-w-sm leading-relaxed">
            Tournament results, decklist data, and meta breakdowns from every
            ChinoizeCup event
          </p>

          {/* Inline stats row */}
          <div className="flex items-center gap-4 sm:gap-6 mt-5 sm:mt-6 pt-4 border-t border-white/[0.06]">
            <div>
              <span className="text-xl sm:text-2xl font-bold text-foreground font-data">
                {totalTournaments}
              </span>
              <span className="text-[11px] text-muted-foreground ml-1.5">
                events
              </span>
            </div>
            <div className="w-px h-6 bg-white/[0.08]" />
            <div>
              <span className="text-xl sm:text-2xl font-bold text-foreground font-data">
                {uniquePlayers}
              </span>
              <span className="text-[11px] text-muted-foreground ml-1.5">
                players
              </span>
            </div>
            <div className="w-px h-6 bg-white/[0.08]" />
            <div>
              <span className="text-xl sm:text-2xl font-bold text-foreground font-data">
                {uniqueLeaders}
              </span>
              <span className="text-[11px] text-muted-foreground ml-1.5">
                leaders
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cells ── */}
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            variants={item}
            className="relative overflow-hidden rounded-2xl bg-card border border-border p-4 sm:p-5 flex flex-col justify-between min-h-[110px]"
          >
            {/* Top accent line */}
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background: "linear-gradient(to right, transparent, var(--accent-line), transparent)",
              }}
            />
            <div className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <AnimatedCounter
              value={stat.value}
              duration={2}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-data tracking-tight"
            />
          </motion.div>
        );
      })}

      {/* ── Latest Event ── */}
      {latestTournament ? (
        <motion.div variants={item}>
          <Link
            href={`/tournaments/${latestTournament.id}`}
            className="flex flex-col justify-between h-full relative overflow-hidden rounded-2xl bg-card border border-border p-4 sm:p-5 group hover:border-primary/20 transition-colors min-h-[110px]"
          >
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--accent-line), transparent)",
              }}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Latest Event
                </span>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
            </div>

            {/* Event details */}
            <div className="mt-auto space-y-2.5">
              <div>
                <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                  {latestTournament.name}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] text-muted-foreground font-data">
                    {formatDate(latestTournament.date)}
                  </span>
                  <span className="text-muted-foreground/30">&middot;</span>
                  <span className="text-[11px] text-muted-foreground">
                    <span className="font-data font-medium text-foreground">
                      {latestTournament.playerCount}
                    </span>{" "}
                    players
                  </span>
                </div>
              </div>

              {/* Winner row */}
              {latestTournament.winner && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  {latestTournament.winner.leaderSet &&
                  latestTournament.winner.leaderNumber ? (
                    <LeaderIcon
                      set={latestTournament.winner.leaderSet}
                      number={latestTournament.winner.leaderNumber}
                      name={latestTournament.winner.leaderName ?? undefined}
                      size={24}
                      className="rounded shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-warning/10 flex items-center justify-center shrink-0">
                      <Crown className="w-3 h-3 text-warning" />
                    </div>
                  )}
                  <div className="flex items-center gap-1 min-w-0 text-[11px]">
                    <Crown className="w-2.5 h-2.5 text-warning shrink-0" />
                    <span className="font-medium text-foreground truncate">
                      {latestTournament.winner.displayName}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={item}>
          <Link
            href="/tier-list"
            className="flex flex-col justify-between h-full relative overflow-hidden rounded-2xl bg-card border border-border p-4 sm:p-5 group hover:border-primary/20 transition-colors min-h-[110px]"
          >
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--accent-line), transparent)",
              }}
            />
            <div className="flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Explore
              </span>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                View Tier List
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </motion.div>
      )}
    </motion.section>
  );
}
