import { getPlayerLeaderboard } from "@/lib/queries/players";
import { getCurrentFormat, getAllFormats, getFormatBySetCode } from "@/lib/queries/formats";
import { PageTransition } from "@/components/ui/page-transition";
import { FormatSelector } from "@/components/ui/format-selector";
import { PlayerLeaderboardTable } from "@/components/players/player-leaderboard-table";

export const dynamic = "force-dynamic";

interface PlayersPageProps {
  searchParams: Promise<{ format?: string }>;
}

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  const params = await searchParams;
  const formatParam = params.format;

  const [currentFormat, allFormats] = await Promise.all([
    getCurrentFormat(),
    getAllFormats(),
  ]);

  let activeFormat = currentFormat;
  if (formatParam === "all") {
    activeFormat = null;
  } else if (formatParam && formatParam !== currentFormat?.setCode) {
    activeFormat = await getFormatBySetCode(formatParam);
  }

  const players = await getPlayerLeaderboard(activeFormat?.tournamentIds);

  const formatOptions = allFormats.map((f) => ({
    setCode: f.setCode,
    displayName: f.displayName,
    tournamentCount: f.tournamentIds.length,
  }));

  const activeFormatValue = formatParam === "all" ? "all" : (activeFormat?.setCode ?? currentFormat?.setCode ?? "all");
  const displayFormatName = activeFormat?.displayName ?? (formatParam === "all" ? "All Time" : null);

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
            currentFormatCode={currentFormat?.setCode ?? ""}
            value={activeFormatValue}
          />
        </div>

        {/* Leaderboard table */}
        <PlayerLeaderboardTable players={players} />
      </div>
    </PageTransition>
  );
}
