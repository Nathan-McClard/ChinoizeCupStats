"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TierBadge } from "@/components/ui/tier-badge";

interface TierHeroProps {
  leaderCount: number;
  tierCounts: Record<"S" | "A" | "B" | "C" | "U", number>;
  formatName?: string | null;
  avgWinRate: number;
  totalEntries: number;
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

const tiers = ["S", "A", "B", "C", "U"] as const;

export function TierHero({
  leaderCount,
  tierCounts,
  formatName,
  avgWinRate,
  totalEntries,
}: TierHeroProps) {
  const qualifiedCount = leaderCount - tierCounts.U;

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl bg-card border border-border"
    >
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

      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--accent-line), transparent)",
        }}
      />

      <div className="relative p-6 sm:p-8">
        {/* Pulse indicator */}
        <motion.div variants={item} className="flex items-center gap-2 mb-3">
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
            Meta Rankings
          </span>
          {formatName && (
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
              {formatName}
            </span>
          )}
        </motion.div>

        <motion.h1
          variants={item}
          className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-foreground"
        >
          Tier List
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-2 text-sm text-muted-foreground/70 max-w-md leading-relaxed"
        >
          Leaders ranked by composite performance across win rate, top finishes,
          and meta share
        </motion.p>

        {/* Stats + Distribution */}
        <motion.div variants={item} className="mt-6 pt-5 border-t border-border/50">
          {/* Inline stats */}
          <div className="flex items-center gap-4 sm:gap-6 mb-5">
            <div>
              <span className="text-xl sm:text-2xl font-bold text-foreground font-data">
                <AnimatedCounter value={qualifiedCount} decimals={0} />
              </span>
              <span className="text-[11px] text-muted-foreground ml-1.5">
                ranked
              </span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div>
              <span className="text-xl sm:text-2xl font-bold text-foreground font-data">
                <AnimatedCounter
                  value={avgWinRate * 100}
                  decimals={1}
                  suffix="%"
                />
              </span>
              <span className="text-[11px] text-muted-foreground ml-1.5">
                avg WR
              </span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div>
              <span className="text-xl sm:text-2xl font-bold text-foreground font-data">
                <AnimatedCounter value={totalEntries} decimals={0} />
              </span>
              <span className="text-[11px] text-muted-foreground ml-1.5">
                entries
              </span>
            </div>
          </div>

          {/* Tier distribution bar */}
          <div className="space-y-2.5">
            <div className="flex h-2.5 rounded-full overflow-hidden bg-black/[0.04] dark:bg-white/[0.04]">
              {tiers
                .filter((t) => tierCounts[t] > 0)
                .map((tier) => (
                  <motion.div
                    key={tier}
                    className="h-full"
                    style={{
                      backgroundColor: `var(--color-tier-${tier.toLowerCase()})`,
                    }}
                    initial={{ flex: 0 }}
                    animate={{ flex: tierCounts[tier] }}
                    transition={{
                      duration: 1,
                      delay: 0.5,
                      ease: [0.16, 1, 0.3, 1] as const,
                    }}
                  />
                ))}
            </div>
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              {tiers.map((tier) =>
                tierCounts[tier] > 0 ? (
                  <div
                    key={tier}
                    className="flex items-center gap-1.5 text-[11px]"
                  >
                    <TierBadge tier={tier} size="sm" />
                    <span className="font-data font-medium text-foreground">
                      {tierCounts[tier]}
                    </span>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
