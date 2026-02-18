"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { LeaderIcon, getLeaderImageUrl } from "@/components/ui/leader-icon";
import { Users, Crown, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";

interface TournamentListItem {
  id: string;
  name: string;
  date: string;
  playerCount: number;
  winner?: {
    displayName: string;
    leaderName: string | null;
    leaderSet: string | null;
    leaderNumber: string | null;
    deckId: string | null;
    wins: number;
    losses: number;
  } | null;
}

interface TournamentListProps {
  tournaments: TournamentListItem[];
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function TournamentList({ tournaments }: TournamentListProps) {
  if (tournaments.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        No tournaments found.
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
    >
      {tournaments.map((tournament) => {
        const winnerImgUrl =
          tournament.winner?.leaderSet && tournament.winner?.leaderNumber
            ? getLeaderImageUrl(
                tournament.winner.leaderSet,
                tournament.winner.leaderNumber
              )
            : null;

        return (
          <motion.div key={tournament.id} variants={item}>
            <Link
              href={`/tournaments/${tournament.id}`}
              className="group block relative overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 hover:-translate-y-0.5 hover:border-border/80 dark:hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/[0.05] dark:hover:shadow-black/[0.2]"
            >
              {/* Winner card art background */}
              {winnerImgUrl && (
                <div className="pointer-events-none absolute inset-0">
                  <Image
                    src={winnerImgUrl}
                    alt=""
                    fill
                    className="object-cover object-top opacity-[0.06] dark:opacity-[0.05] group-hover:opacity-[0.10] dark:group-hover:opacity-[0.08] transition-opacity duration-500"
                    style={{
                      maskImage:
                        "linear-gradient(to bottom, black 20%, transparent 80%)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, black 20%, transparent 80%)",
                    }}
                    unoptimized
                  />
                </div>
              )}

              <div className="relative p-4 sm:p-5 flex flex-col gap-3">
                {/* Top row: date + player count */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-muted-foreground font-data">
                    {format(parseISO(tournament.date), "MMM d, yyyy")}
                  </span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span className="text-[11px] font-data font-medium text-foreground">
                      {tournament.playerCount}
                    </span>
                  </div>
                </div>

                {/* Tournament name */}
                <h3 className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                  {tournament.name}
                </h3>

                {/* Winner row */}
                {tournament.winner ? (
                  <div className="flex items-center gap-2.5 pt-2.5 border-t border-border">
                    {tournament.winner.leaderSet &&
                    tournament.winner.leaderNumber ? (
                      <LeaderIcon
                        set={tournament.winner.leaderSet}
                        number={tournament.winner.leaderNumber}
                        name={tournament.winner.leaderName ?? undefined}
                        size={36}
                        className="rounded-lg shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-[#ff9f0a]/10 flex items-center justify-center shrink-0">
                        <Crown className="w-4 h-4 text-[#ff9f0a]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5 text-[#ff9f0a]" />
                        <span className="text-xs font-semibold text-foreground truncate">
                          {tournament.winner.displayName}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {tournament.winner.leaderName}
                        {tournament.winner.wins != null && (
                          <>
                            <span className="text-muted-foreground/40 mx-1">
                              &middot;
                            </span>
                            <span className="font-data">
                              {tournament.winner.wins}-
                              {tournament.winner.losses}
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2.5 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      View results
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
