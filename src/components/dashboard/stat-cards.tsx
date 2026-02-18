"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Trophy, Users, Crown, TrendingUp } from "lucide-react";

interface StatCardsProps {
  totalTournaments: number;
  uniquePlayers: number;
  topLeader: { name: string; winRate: number } | null;
  bestWinRate: { name: string; winRate: number } | null;
}

const cards = [
  {
    key: "tournaments",
    label: "Total Tournaments",
    icon: Trophy,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    key: "players",
    label: "Unique Players",
    icon: Users,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    key: "topLeader",
    label: "Most Played Leader",
    icon: Crown,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    key: "bestWinRate",
    label: "Highest Win Rate",
    icon: TrendingUp,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
] as const;

export function StatCards({
  totalTournaments,
  uniquePlayers,
  topLeader,
  bestWinRate,
}: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Tournaments */}
      <GlassCard
        className="p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0 }}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{cards[0].label}</p>
            <AnimatedCounter
              value={totalTournaments}
              className="text-3xl font-bold text-foreground font-data"
            />
          </div>
          <div className={`rounded-lg ${cards[0].iconBg} p-2.5`}>
            <Trophy className={`h-5 w-5 ${cards[0].iconColor}`} />
          </div>
        </div>
      </GlassCard>

      {/* Unique Players */}
      <GlassCard
        className="p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{cards[1].label}</p>
            <AnimatedCounter
              value={uniquePlayers}
              className="text-3xl font-bold text-foreground font-data"
            />
          </div>
          <div className={`rounded-lg ${cards[1].iconBg} p-2.5`}>
            <Users className={`h-5 w-5 ${cards[1].iconColor}`} />
          </div>
        </div>
      </GlassCard>

      {/* Most Played Leader */}
      <GlassCard
        className="p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{cards[2].label}</p>
            {topLeader ? (
              <>
                <p className="text-lg font-bold text-foreground truncate max-w-[180px]">
                  {topLeader.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  <AnimatedCounter
                    value={topLeader.winRate * 100}
                    decimals={1}
                    suffix="%"
                    className="text-primary font-semibold font-data"
                  />{" "}
                  win rate
                </p>
              </>
            ) : (
              <p className="text-lg text-muted-foreground">--</p>
            )}
          </div>
          <div className={`rounded-lg ${cards[2].iconBg} p-2.5`}>
            <Crown className={`h-5 w-5 ${cards[2].iconColor}`} />
          </div>
        </div>
      </GlassCard>

      {/* Highest Win Rate */}
      <GlassCard
        className="p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{cards[3].label}</p>
            {bestWinRate ? (
              <>
                <p className="text-lg font-bold text-foreground truncate max-w-[180px]">
                  {bestWinRate.name}
                </p>
                <AnimatedCounter
                  value={bestWinRate.winRate * 100}
                  decimals={1}
                  suffix="%"
                  className="text-primary text-2xl font-bold font-data"
                />
              </>
            ) : (
              <p className="text-lg text-muted-foreground">--</p>
            )}
          </div>
          <div className={`rounded-lg ${cards[3].iconBg} p-2.5`}>
            <TrendingUp className={`h-5 w-5 ${cards[3].iconColor}`} />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
