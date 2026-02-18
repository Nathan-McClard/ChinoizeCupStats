"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { LeaderTierCard } from "@/components/tier-list/leader-tier-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TIER_COLORS } from "@/lib/charts";
import type { LeaderStats } from "@/lib/queries/leaders";

interface TierSectionProps {
  tier: "S" | "A" | "B" | "C" | "U";
  leaders: LeaderStats[];
  rankOffset?: number;
}

// Uniform grid for all ranked tiers — same card size everywhere
const GRID = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5";
const GAP = "gap-3";

const tierConfig = {
  S: {
    stagger: 0.06,
    entryY: 24,
    entryBlur: 6,
    entryDuration: 0.7,
    letterSize: "text-[120px] sm:text-[160px]",
    letterWeight: "font-black",
    letterOpacity: "opacity-[0.04] dark:opacity-[0.06]",
  },
  A: {
    stagger: 0.05,
    entryY: 20,
    entryBlur: 4,
    entryDuration: 0.6,
    letterSize: "text-[100px] sm:text-[130px]",
    letterWeight: "font-bold",
    letterOpacity: "opacity-[0.035] dark:opacity-[0.05]",
  },
  B: {
    stagger: 0.04,
    entryY: 16,
    entryBlur: 3,
    entryDuration: 0.6,
    letterSize: "text-[80px] sm:text-[100px]",
    letterWeight: "font-bold",
    letterOpacity: "opacity-[0.03] dark:opacity-[0.04]",
  },
  C: {
    stagger: 0.03,
    entryY: 12,
    entryBlur: 2,
    entryDuration: 0.5,
    letterSize: "text-[60px] sm:text-[80px]",
    letterWeight: "font-semibold",
    letterOpacity: "opacity-[0.025] dark:opacity-[0.035]",
  },
  U: {
    stagger: 0,
    entryY: 10,
    entryBlur: 2,
    entryDuration: 0.4,
    letterSize: "text-[40px]",
    letterWeight: "font-medium",
    letterOpacity: "opacity-[0.02] dark:opacity-[0.03]",
  },
} as const;

const tierDescriptions: Record<string, string> = {
  S: "Elite",
  A: "Strong",
  B: "Viable",
  C: "Niche",
  U: "Unranked",
};

const tierColors: Record<string, string> = TIER_COLORS;

export function TierSection({
  tier,
  leaders,
  rankOffset = 0,
}: TierSectionProps) {
  const [uExpanded, setUExpanded] = useState(false);

  if (leaders.length === 0) return null;

  const config = tierConfig[tier];
  const color = tierColors[tier];

  const avgWinRate =
    leaders.reduce((s, l) => s + l.winRate, 0) / leaders.length;
  const totalEntries = leaders.reduce((s, l) => s + l.totalEntries, 0);

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: config.stagger } },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: config.entryY,
      filter: `blur(${config.entryBlur}px)`,
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: config.entryDuration,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  // ── U Tier: collapsible ──
  if (tier === "U") {
    return (
      <section id="tier-U" className="scroll-mt-28">
        <button
          onClick={() => setUExpanded((o) => !o)}
          className="flex items-center gap-3 w-full cursor-pointer group"
        >
          <div className="h-px flex-1 bg-border/40" />
          <span className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-[0.15em]">
            Unranked
          </span>
          <span className="text-[10px] text-muted-foreground/30 font-data">
            {leaders.length}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-muted-foreground/30 transition-transform duration-300 ${uExpanded ? "rotate-180" : ""}`}
          />
          <div className="h-px flex-1 bg-border/40" />
        </button>

        <AnimatePresence>
          {uExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1] as const,
              }}
              className="overflow-hidden"
            >
              <div
                className={`grid ${GRID} ${GAP} pt-6`}
              >
                {leaders.map((leader, i) => (
                  <LeaderTierCard
                    key={leader.deckId}
                    leader={leader}
                    rank={rankOffset + i + 1}
                    tierColor={color}
                    index={i}
                    variant="minimal"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    );
  }

  // ── S / A / B / C: Editorial header + uniform grid ──
  const isC = tier === "C";

  return (
    <section id={`tier-${tier}`} className="scroll-mt-28">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {/* Editorial tier header */}
        <motion.div variants={itemVariants} className="relative mb-5">
          <div className="flex items-end gap-3 sm:gap-4">
            {/* Large tier letter */}
            <div className="relative">
              <span
                className={`${config.letterSize} ${config.letterWeight} leading-none tracking-tighter text-foreground ${config.letterOpacity} select-none`}
              >
                {tier}
              </span>
              <div
                className="absolute bottom-1 left-0 right-0 h-px rounded-full"
                style={{
                  background: `linear-gradient(to right, ${color}${isC ? "40" : "80"}, transparent)`,
                }}
              />
            </div>
            <div className={tier === "S" ? "pb-4" : isC ? "pb-2" : "pb-3"}>
              <p
                className={`font-medium ${isC ? "text-xs text-muted-foreground" : "text-sm text-foreground"}`}
              >
                {tierDescriptions[tier]}
              </p>
              <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                <span>
                  {leaders.length} leader{leaders.length !== 1 ? "s" : ""}
                </span>
                {!isC && (
                  <>
                    <span className="text-border">&middot;</span>
                    <span>
                      <span className="font-data font-semibold text-foreground">
                        {tier === "S" ? (
                          <AnimatedCounter
                            value={avgWinRate * 100}
                            decimals={1}
                            suffix="%"
                          />
                        ) : (
                          `${(avgWinRate * 100).toFixed(1)}%`
                        )}
                      </span>{" "}
                      avg WR
                    </span>
                    {tier === "S" && (
                      <>
                        <span className="text-border">&middot;</span>
                        <span>
                          <span className="font-data font-semibold text-foreground">
                            <AnimatedCounter
                              value={totalEntries}
                              decimals={0}
                            />
                          </span>{" "}
                          entries
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Uniform card grid */}
        <div className={`grid ${GRID} ${GAP}`}>
          {leaders.map((leader, i) => (
            <motion.div key={leader.deckId} variants={itemVariants}>
              <LeaderTierCard
                leader={leader}
                rank={rankOffset + i + 1}
                tierColor={color}
                index={i}
                variant="standard"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
