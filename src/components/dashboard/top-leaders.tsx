"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { getLeaderImageUrl } from "@/components/ui/leader-icon";
import { Crown, ArrowRight } from "lucide-react";

interface TopLeader {
  deckId: string;
  leaderName: string;
  leaderSet: string;
  leaderNumber: string;
  winRate: number;
  totalEntries: number;
  tournamentWins: number;
}

interface TopLeadersProps {
  leaders: TopLeader[];
}

const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function LeaderCard({ leader, index }: { leader: TopLeader; index: number }) {
  const imageUrl = getLeaderImageUrl(leader.leaderSet, leader.leaderNumber);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/leaders/${leader.deckId}`} className="block group">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-black/[0.06] dark:group-hover:shadow-black/[0.25] group-hover:border-border/80 dark:group-hover:border-white/[0.12]">
          {/* Spotlight gradient — follows cursor */}
          <div
            className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, color-mix(in srgb, var(--primary) 7%, transparent), transparent 60%)`,
            }}
          />

          {/* Card image */}
          <div className="relative h-36 sm:h-40 overflow-hidden">
            <Image
              src={imageUrl}
              alt={leader.leaderName}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
            {/* Gradient fade to card surface */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-[var(--card)]/40 to-transparent" />
          </div>

          {/* Info */}
          <div className="relative z-20 p-3.5 pt-1">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {leader.leaderName}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 mb-2.5 font-data">
              {leader.deckId}
            </p>

            {/* Win rate bar */}
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  whileInView={{
                    width: `${Math.min(leader.winRate * 100, 100)}%`,
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1,
                    delay: 0.3 + index * 0.06,
                    ease: "easeOut",
                  }}
                />
              </div>
              <span className="text-xs font-semibold font-data text-foreground min-w-[38px] text-right">
                <AnimatedCounter
                  value={leader.winRate * 100}
                  decimals={1}
                  suffix="%"
                  duration={1.5}
                />
              </span>
            </div>

            {/* Bottom stats */}
            <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground font-data">
                  {leader.totalEntries}
                </span>{" "}
                entries
              </span>
              {leader.tournamentWins > 0 && (
                <span className="text-[11px] text-warning">
                  <span className="font-semibold font-data">
                    {leader.tournamentWins}
                  </span>{" "}
                  win{leader.tournamentWins !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function TopLeaders({ leaders }: TopLeadersProps) {
  const dataKey = useMemo(
    () => leaders.map((l) => l.deckId).join(","),
    [leaders],
  );

  if (leaders.length === 0) return null;

  return (
    <motion.section
      key={dataKey}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      <motion.div
        className="flex items-center justify-between mb-5"
        variants={itemVariants}
      >
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Current Meta Leaders
          </h2>
        </div>
        <Link
          href="/tier-list"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
        >
          View Tier List
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {leaders.map((leader, i) => (
          <LeaderCard key={leader.deckId} leader={leader} index={i} />
        ))}
      </div>

      <Link
        href="/tier-list"
        className="sm:hidden flex items-center justify-center gap-1.5 mt-4 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
      >
        View Tier List
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.section>
  );
}
