"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { LeaderIcon, parseDeckId } from "@/components/ui/leader-icon";
import { TrendingUp, ArrowRight } from "lucide-react";

interface MetaPieChartProps {
  data: Array<{
    deckId: string;
    leaderName: string;
    leaderSet: string | null;
    leaderNumber: string | null;
    count: number;
    share: number;
  }>;
}

const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const barVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function MetaPieChart({ data }: MetaPieChartProps) {
  const SHOW_COUNT = 15;
  const leaders = data.slice(0, SHOW_COUNT);
  const rest = data.slice(SHOW_COUNT);
  const otherCount = rest.reduce((sum, d) => sum + Number(d.count), 0);
  const total = data.reduce((sum, d) => sum + Number(d.count), 0);
  const maxCount = leaders.length > 0 ? Number(leaders[0].count) : 1;

  if (data.length === 0) {
    return (
      <GlassCard className="p-5 sm:p-6 h-full flex items-center justify-center text-muted-foreground">
        No data available
      </GlassCard>
    );
  }

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <GlassCard className="p-5 sm:p-6 h-full flex flex-col">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between mb-5"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground leading-tight">
                Meta Distribution
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {total.toLocaleString()} total entries
              </p>
            </div>
          </div>
          <Link
            href="/trends"
            className="text-xs text-primary hover:text-primary/80 transition-colors font-medium hidden sm:flex items-center gap-1"
          >
            View trends
            <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* Ranked bar list */}
        <div className="space-y-1">
          {leaders.map((d, i) => {
            const count = Number(d.count);
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
            const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const iconSet = d.leaderSet ?? parseDeckId(d.deckId)?.set;
            const iconNum = d.leaderNumber ?? parseDeckId(d.deckId)?.number;
            // Primary blue with decreasing opacity for ranked list
            const opacity = 1 - (i / SHOW_COUNT) * 0.6;
            const color = `color-mix(in srgb, var(--primary) ${Math.round(opacity * 100)}%, transparent)`;

            return (
              <motion.div
                key={d.deckId}
                variants={itemVariants}
                className="group flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors"
              >
                {/* Rank */}
                <span className="text-[11px] font-semibold text-muted-foreground w-5 text-right font-data shrink-0">
                  {i + 1}
                </span>

                {/* Leader icon */}
                {iconSet && iconNum ? (
                  <LeaderIcon
                    set={iconSet}
                    number={iconNum}
                    name={d.leaderName}
                    size={28}
                    className="rounded-lg shrink-0"
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-lg shrink-0"
                    style={{ backgroundColor: color }}
                  />
                )}

                {/* Name + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <span className="text-xs font-medium text-foreground truncate">
                      {d.leaderName}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] text-muted-foreground font-data">
                        {count}
                      </span>
                      <span className="text-[11px] font-semibold text-foreground font-data min-w-[36px] text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Animated bar */}
                  <div className="h-1.5 rounded-full bg-black/[0.05] dark:bg-white/[0.05] overflow-hidden">
                    <motion.div
                      variants={barVariants}
                      className="h-full rounded-full origin-left"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Other row */}
          {otherCount > 0 && (
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2.5 py-1.5 px-2 -mx-2"
            >
              <span className="text-[11px] text-muted-foreground w-5 text-right font-data shrink-0">
                &middot;
              </span>
              <div className="w-7 h-7 rounded-lg bg-black/[0.06] dark:bg-white/[0.06] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <span className="text-xs text-muted-foreground">
                    Other ({rest.length} leaders)
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] text-muted-foreground font-data">
                      {otherCount}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground font-data min-w-[36px] text-right">
                      {total > 0
                        ? ((otherCount / total) * 100).toFixed(1)
                        : "0.0"}
                      %
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-black/[0.05] dark:bg-white/[0.05] overflow-hidden">
                  <motion.div
                    variants={barVariants}
                    className="h-full rounded-full bg-black/[0.12] dark:bg-white/[0.12] origin-left"
                    style={{
                      width: `${maxCount > 0 ? (otherCount / maxCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Mobile link */}
        <Link
          href="/trends"
          className="sm:hidden mt-4 pt-3 border-t border-border flex items-center justify-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
        >
          Meta Trends
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </GlassCard>
    </motion.div>
  );
}
