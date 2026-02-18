"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { LeaderIcon } from "@/components/ui/leader-icon";

interface LeaderPickerProps {
  leaders: Array<{
    deckId: string;
    leaderName: string;
    leaderSet: string;
    leaderNumber: string;
    totalEntries: number;
    playRate: number;
  }>;
  formatParam?: string;
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function LeaderPicker({ leaders, formatParam }: LeaderPickerProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
    >
      {leaders.map((leader) => {
        const href = formatParam
          ? `/decklists?deckId=${leader.deckId}&format=${formatParam}`
          : `/decklists?deckId=${leader.deckId}`;

        return (
          <motion.div key={leader.deckId} variants={item}>
            <Link
              href={href}
              className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
            >
              <LeaderIcon
                set={leader.leaderSet}
                number={leader.leaderNumber}
                name={leader.leaderName}
                size={64}
                className="shrink-0"
              />
              <div className="text-center min-w-0 w-full">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {leader.leaderName}
                </p>
                <p className="text-xs text-muted-foreground font-data mt-0.5">
                  {leader.totalEntries.toLocaleString()} entries &middot;{" "}
                  {(leader.playRate * 100).toFixed(1)}%
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
