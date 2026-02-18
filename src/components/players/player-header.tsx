"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Trophy, Target, Calendar, Medal, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PlayerHeaderProps {
  displayName: string;
  country: string;
  rank: number;
  totalPoints: number;
  winRate: number;
  tournamentsPlayed: number;
  top4Count: number;
  bestPlacing: number;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-400/20">
        <Trophy className="w-5 h-5 text-amber-400" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-300/10 font-bold text-lg text-slate-500 dark:text-slate-300">
        {rank}
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-700/10 font-bold text-lg text-amber-600">
        {rank}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] text-muted-foreground text-lg font-medium">
      #{rank}
    </div>
  );
}

function getWinRateTextColor(winRate: number): string {
  if (winRate > 0.55) return "text-emerald-400";
  if (winRate >= 0.45) return "text-amber-400";
  return "text-red-400";
}

const statCards = [
  {
    key: "totalPoints",
    label: "Total Points",
    icon: Trophy,
    format: "number" as const,
    iconColor: "text-amber-400",
  },
  {
    key: "winRate",
    label: "Win Rate",
    icon: Target,
    format: "percent" as const,
    iconColor: "", // dynamic
  },
  {
    key: "tournamentsPlayed",
    label: "Events Played",
    icon: Calendar,
    format: "number" as const,
    iconColor: "text-cyan-400",
  },
  {
    key: "top4Count",
    label: "Top 4 Finishes",
    icon: Medal,
    format: "number" as const,
    iconColor: "text-blue-400",
  },
  {
    key: "bestPlacing",
    label: "Best Placing",
    icon: TrendingUp,
    format: "number" as const,
    iconColor: "text-violet-400",
  },
] as const;

export function PlayerHeader({
  displayName,
  country,
  rank,
  totalPoints,
  winRate,
  tournamentsPlayed,
  top4Count,
  bestPlacing,
}: PlayerHeaderProps) {
  const values: Record<string, number> = {
    totalPoints,
    winRate: winRate * 100,
    tournamentsPlayed,
    top4Count,
    bestPlacing,
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/players"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Players
      </Link>

      {/* Hero Section */}
      <GlassCard
        glow="none"
        className="p-6"
      >
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <RankBadge rank={rank} />
          </motion.div>

          <div className="flex-1 min-w-0">
            <motion.h1
              className="text-2xl sm:text-3xl font-bold text-foreground truncate"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {displayName}
            </motion.h1>
            {country && (
              <motion.p
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {country}
              </motion.p>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          const value = values[stat.key];
          const iconColor =
            stat.key === "winRate" ? getWinRateTextColor(winRate) : stat.iconColor;

          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
            >
              <GlassCard className="p-4 text-center">
                <Icon className={`w-5 h-5 mx-auto mb-2 ${iconColor}`} />
                <div className="text-xl font-bold text-foreground font-data">
                  <AnimatedCounter
                    value={value}
                    decimals={stat.format === "percent" ? 1 : 0}
                    suffix={stat.format === "percent" ? "%" : ""}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
