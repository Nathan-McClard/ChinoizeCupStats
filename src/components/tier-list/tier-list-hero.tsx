"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TierBadge } from "@/components/ui/tier-badge";
import { getLeaderImageUrl } from "@/components/ui/leader-icon";
import type { LeaderStats } from "@/lib/queries/leaders";

interface TierListHeroProps {
  totalLeaders: number;
  topLeaders: LeaderStats[];
  formatName?: string | null;
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
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

const podiumColors = [
  { accent: "#ff9f0a", label: "1st", ring: "ring-[#ff9f0a]/30" },
  { accent: "#c0c0c0", label: "2nd", ring: "ring-[#c0c0c0]/30" },
  { accent: "#cd7f32", label: "3rd", ring: "ring-[#cd7f32]/30" },
];

function PodiumCard({
  leader,
  place,
  isCenter,
}: {
  leader: LeaderStats;
  place: number;
  isCenter: boolean;
}) {
  const imageUrl = getLeaderImageUrl(leader.leaderSet, leader.leaderNumber);
  const colors = podiumColors[place];
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={item}
      className={isCenter ? "sm:-mt-4 sm:mb-4 z-10" : "z-0"}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/leaders/${leader.deckId}`} className="block group">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-black/[0.06] dark:group-hover:shadow-black/[0.25] group-hover:border-border/80 dark:group-hover:border-white/[0.12]">
          {/* Top accent line */}
          <div
            className="absolute inset-x-0 top-0 h-[2px] z-20"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${colors.accent}40 25%, ${colors.accent}80 50%, ${colors.accent}40 75%, transparent 100%)`,
            }}
          />

          {/* Cursor spotlight */}
          <div
            className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, ${colors.accent}18, transparent 60%)`,
            }}
          />

          {/* Card art */}
          <div
            className={`relative overflow-hidden ${isCenter ? "h-52 sm:h-72" : "h-44 sm:h-60"}`}
          >
            <Image
              src={imageUrl}
              alt={leader.leaderName}
              fill
              className="object-cover object-[center_15%] transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-[var(--card)]/40 to-transparent" />

            {/* Tier badge — top right */}
            <div className="absolute top-2.5 right-2.5 z-20">
              <TierBadge tier={leader.tier} size="sm" />
            </div>

            {/* Rank badge — top left */}
            <div
              className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md backdrop-blur-sm border"
              style={{
                backgroundColor: `${colors.accent}20`,
                borderColor: `${colors.accent}30`,
              }}
            >
              <Crown className="w-3 h-3" style={{ color: colors.accent }} />
              <span
                className="text-[10px] font-bold"
                style={{ color: colors.accent }}
              >
                {colors.label}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="relative z-20 p-3.5 pt-1">
            <h3
              className={`font-semibold text-foreground truncate ${isCenter ? "text-base" : "text-sm"}`}
            >
              {leader.leaderName}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 mb-2.5 font-data">
              {leader.deckId}
            </p>

            {/* Win rate bar */}
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: colors.accent }}
                  initial={{ width: 0 }}
                  whileInView={{
                    width: `${Math.min(leader.winRate * 100, 100)}%`,
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1,
                    delay: 0.4 + place * 0.1,
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

            {/* Stats row */}
            <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground font-data">
                  {leader.totalEntries}
                </span>{" "}
                entries
              </span>
              {leader.tournamentWins > 0 && (
                <span className="text-[11px]" style={{ color: colors.accent }}>
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

export function TierListHero({ totalLeaders, topLeaders, formatName }: TierListHeroProps) {
  // Display order: #2, #1, #3 for podium effect (center = #1)
  const podiumOrder = [topLeaders[1], topLeaders[0], topLeaders[2]].filter(
    Boolean,
  ) as LeaderStats[];
  const placeMap = [1, 0, 2]; // maps display index -> place index (0-based)

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page header */}
      <motion.div variants={item}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-foreground">
          The Three Emperors
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground/70">
          The 3 best leaders of the {formatName ? `${formatName} format` : "current format"}
        </p>
      </motion.div>

      {/* Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        {podiumOrder.map((leader, i) => (
          <PodiumCard
            key={leader.deckId}
            leader={leader}
            place={placeMap[i]}
            isCenter={placeMap[i] === 0}
          />
        ))}
      </div>
    </motion.section>
  );
}
