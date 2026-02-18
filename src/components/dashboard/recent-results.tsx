"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { LeaderIcon } from "@/components/ui/leader-icon";
import { Trophy, Users, ArrowRight, Calendar } from "lucide-react";

interface RecentResult {
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
}

interface RecentResultsProps {
  results: RecentResult[];
}

const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function RecentResults({ results }: RecentResultsProps) {
  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <GlassCard className="p-5 sm:p-6 h-full flex flex-col">
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Recent Events</h3>
          </div>
          <Link
            href="/tournaments"
            className="text-xs text-primary hover:text-primary/80 transition-colors font-medium hidden sm:block"
          >
            View all
          </Link>
        </motion.div>

        {results.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            No tournaments yet
          </div>
        ) : (
          <div className="flex-1 space-y-1">
            {results.slice(0, 6).map((result) => (
              <motion.div key={result.id} variants={itemVariants}>
                <Link
                  href={`/tournaments/${result.id}`}
                  className="flex items-center gap-3 p-2.5 -mx-1 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors group"
                >
                  {/* Winner leader icon or date badge */}
                  {result.winner?.leaderSet && result.winner?.leaderNumber ? (
                    <LeaderIcon
                      set={result.winner.leaderSet}
                      number={result.winner.leaderNumber}
                      name={result.winner.leaderName ?? undefined}
                      size={40}
                      className="shrink-0 rounded-xl"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {result.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {result.winner && (
                        <span className="text-xs text-muted-foreground truncate">
                          {result.winner.displayName}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground/50">&middot;</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(result.date)}
                      </span>
                    </div>
                  </div>

                  {/* Player count */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span className="text-xs font-data font-medium text-foreground">
                        {result.playerCount}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <Link
          href="/tournaments"
          className="mt-4 pt-3 border-t border-border flex items-center justify-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
        >
          All Tournaments
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </GlassCard>
    </motion.div>
  );
}
