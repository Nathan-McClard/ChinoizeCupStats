"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { getLeaderImageUrl } from "@/components/ui/leader-icon";
import { Trophy } from "lucide-react";
import type { LeaderStats } from "@/lib/queries/leaders";

type CardVariant = "standard" | "minimal";

interface LeaderTierCardProps {
  leader: LeaderStats;
  rank: number;
  tierColor: string;
  index: number;
  variant?: CardVariant;
}

function getWinRateBarColor(winRate: number): string {
  if (winRate > 0.55) return "var(--success)";
  if (winRate >= 0.48) return "var(--primary)";
  if (winRate >= 0.42) return "var(--warning)";
  return "var(--error)";
}

export function LeaderTierCard({
  leader,
  rank,
  tierColor,
  index,
  variant = "standard",
}: LeaderTierCardProps) {
  const imageUrl = getLeaderImageUrl(leader.leaderSet, leader.leaderNumber);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const barColor = getWinRateBarColor(leader.winRate);
  const isMinimal = variant === "minimal";

  return (
    <motion.div
      onMouseMove={
        !isMinimal
          ? (e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }
          : undefined
      }
      onMouseEnter={!isMinimal ? () => setIsHovered(true) : undefined}
      onMouseLeave={!isMinimal ? () => setIsHovered(false) : undefined}
    >
      <Link href={`/leaders/${leader.deckId}`} className="block group">
        <div
          className={`relative overflow-hidden rounded-2xl bg-card border transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-black/[0.06] dark:group-hover:shadow-black/[0.25] group-hover:border-border/80 dark:group-hover:border-white/[0.12] ${
            isMinimal
              ? "border-border/50 opacity-80 group-hover:opacity-100"
              : "border-border"
          }`}
          style={
            !isMinimal && isHovered
              ? {
                  boxShadow: `0 8px 32px ${tierColor}18, 0 0 0 1px ${tierColor}10`,
                }
              : undefined
          }
        >
          {/* Subtle top accent line */}
          {!isMinimal && (
            <div
              className="absolute inset-x-0 top-0 z-20"
              style={{
                height: "1px",
                background: `linear-gradient(90deg, transparent 5%, ${tierColor}50 50%, transparent 95%)`,
              }}
            />
          )}

          {/* Cursor-following spotlight */}
          {!isMinimal && (
            <div
              className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
              style={{
                opacity: isHovered ? 1 : 0,
                background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, ${tierColor}18, transparent 60%)`,
              }}
            />
          )}

          {/* Card art area — uniform height for all cards */}
          <div className="relative overflow-hidden h-36 sm:h-40">
            <Image
              src={imageUrl}
              alt={leader.leaderName}
              fill
              className="object-cover object-[center_10%] transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-[var(--card)]/40 to-transparent" />

            {/* Rank number */}
            {!isMinimal && (
              <div className="absolute top-2 left-2.5 z-20">
                <span
                  className="font-data font-black text-xl leading-none drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
                  style={{
                    color: "white",
                    textShadow: `0 0 20px ${tierColor}60`,
                  }}
                >
                  {rank}
                </span>
              </div>
            )}

            {/* Tournament wins indicator */}
            {!isMinimal && leader.tournamentWins > 0 && (
              <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/30 backdrop-blur-sm">
                <Trophy className="w-3 h-3 text-warning" />
                <span className="text-[10px] font-bold text-warning font-data">
                  {leader.tournamentWins}
                </span>
              </div>
            )}
          </div>

          {/* Info section */}
          <div className="relative z-20 p-3.5 pt-1.5">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {leader.leaderName}
            </h3>
            <p className="text-[11px] text-muted-foreground font-data mt-0.5 mb-2">
              {leader.deckId}
            </p>

            {/* Win rate bar */}
            {!isMinimal && (
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="flex-1 h-1 rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: barColor }}
                    initial={{ width: 0 }}
                    whileInView={{
                      width: `${Math.min(leader.winRate * 100, 100)}%`,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1,
                      delay: 0.3 + index * 0.04,
                      ease: "easeOut",
                    }}
                  />
                </div>
                <span className="font-semibold font-data text-xs text-foreground min-w-[38px] text-right">
                  <AnimatedCounter
                    value={leader.winRate * 100}
                    decimals={1}
                    suffix="%"
                    duration={1.5}
                  />
                </span>
              </div>
            )}

            {/* Stat row */}
            {!isMinimal && (
              <div className="grid grid-cols-3 gap-1.5">
                <StatCell
                  label="Play Rate"
                  value={leader.playRate * 100}
                  suffix="%"
                  decimals={1}
                />
                <StatCell
                  label="Top 4"
                  value={leader.top4Rate * 100}
                  suffix="%"
                  decimals={1}
                />
                <StatCell
                  label="Entries"
                  value={leader.totalEntries}
                  decimals={0}
                />
              </div>
            )}

            {/* Minimal stats */}
            {isMinimal && (
              <p className="text-[11px] text-muted-foreground">
                <span className="font-data font-medium text-foreground">
                  {leader.totalEntries}
                </span>{" "}
                entries
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function StatCell({
  label,
  value,
  suffix = "",
  decimals = 1,
}: {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <div className="flex flex-col items-center p-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
      <span className="text-[11px] font-medium font-data text-foreground">
        <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
