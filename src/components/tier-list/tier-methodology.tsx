"use client";

import { motion, type Variants } from "framer-motion";

const COMPOSITE_WEIGHTS = [
  {
    factor: "Win Rate",
    weight: 40,
    description: "Overall match win percentage",
    color: "var(--success)",
  },
  {
    factor: "Top 4 Rate",
    weight: 30,
    description: "Rate of finishing in top 4",
    color: "var(--primary)",
  },
  {
    factor: "Tournament Wins",
    weight: 20,
    description: "Normalized 1st place finishes",
    color: "var(--warning)",
  },
  {
    factor: "Play Rate",
    weight: 10,
    description: "Popularity relative to total entries",
    color: "var(--error)",
  },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function TierMethodology() {
  return (
    <motion.section
      id="methodology"
      className="scroll-mt-28"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 sm:p-8 max-w-xl"
      >
        {/* Top accent line */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--accent-line), transparent)",
          }}
        />

        <h3 className="text-base font-semibold text-foreground mb-1">
          Ranking Methodology
        </h3>
        <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
          Each qualified leader (5+ entries) receives a weighted composite score
          from 0 to 1. Leaders are ranked by this score.
        </p>

        <div className="space-y-3">
          {COMPOSITE_WEIGHTS.map((w, i) => (
            <motion.div
              key={w.factor}
              variants={item}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {w.factor}
                </span>
                <span className="text-sm font-bold text-foreground font-data">
                  {w.weight}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-black/[0.04] dark:bg-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: w.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${w.weight}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3 + i * 0.1,
                    ease: "easeOut",
                  }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {w.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}
