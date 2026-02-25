import type { Metadata } from "next";
import { getPlayerLeaderboard } from "@/lib/queries/players";
import { resolveFormatFilter } from "@/lib/queries/formats";
import { PageTransition } from "@/components/ui/page-transition";
import { FormatSelector } from "@/components/ui/format-selector";
import { PlayerLeaderboardTable } from "@/components/players/player-leaderboard-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Players",
  description:
    "Player leaderboard ranked by tournament points, win rate, and top cut finishes across ChinoizeCup events.",
  alternates: { canonical: "/players" },
};

interface PlayersPageProps {
  searchParams: Promise<{ format?: string }>;
}

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  const params = await searchParams;

  const { tournamentIds, activeFormat, activeFormatValue, formatOptions, currentFormatCode } =
    await resolveFormatFilter(params.format);

  const players = await getPlayerLeaderboard(tournamentIds);

  const displayFormatName = activeFormat?.displayName ?? (params.format === "all" ? "All Time" : null);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Player Leaderboard
            </h1>
            <p className="text-sm text-muted-foreground">
              {players.length} players ranked by tournament performance
              {displayFormatName && <span className="text-primary font-medium"> — {displayFormatName} Format</span>}
            </p>
          </div>
          <FormatSelector
            formats={formatOptions}
            currentFormatCode={currentFormatCode}
            value={activeFormatValue}
          />
        </div>

        {/* Leaderboard table */}
        <PlayerLeaderboardTable players={players} />
      </div>
    </PageTransition>
  );
}
