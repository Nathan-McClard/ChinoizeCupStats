export const dynamic = "force-dynamic";

import { getDashboardStats, getRecentTournaments } from "@/lib/queries/tournaments";
import { getLeaderStats, getMetaShareData } from "@/lib/queries/leaders";
import { getCurrentFormat, getAllFormats, getFormatBySetCode } from "@/lib/queries/formats";
import { PageTransition } from "@/components/ui/page-transition";
import { FormatSelector } from "@/components/ui/format-selector";
import { HeroStats } from "@/components/dashboard/hero-stats";
import { TopLeaders } from "@/components/dashboard/top-leaders";
import { MetaPieChart } from "@/components/dashboard/meta-pie-chart";
import { RecentResults } from "@/components/dashboard/recent-results";

interface DashboardPageProps {
  searchParams: Promise<{ format?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const formatParam = params.format;

  const [currentFormat, allFormats] = await Promise.all([
    getCurrentFormat(),
    getAllFormats(),
  ]);

  // Resolve active format based on URL param
  let activeFormat = currentFormat;
  if (formatParam === "all") {
    activeFormat = null;
  } else if (formatParam && formatParam !== currentFormat?.setCode) {
    activeFormat = await getFormatBySetCode(formatParam);
  }

  const formatIds = activeFormat?.tournamentIds;

  const [dashboardStats, recentTournaments, leaderStats, metaShareData] =
    await Promise.all([
      getDashboardStats(formatIds),
      getRecentTournaments(10, formatIds),
      getLeaderStats(formatIds),
      getMetaShareData(formatIds),
    ]);

  // Top 6 leaders by tier ranking (leaderStats is already sorted by composite score)
  const topLeaders = leaderStats
    .filter((l) => l.tier !== "U")
    .slice(0, 6)
    .map((l) => ({
      deckId: l.deckId,
      leaderName: l.leaderName,
      leaderSet: l.leaderSet,
      leaderNumber: l.leaderNumber,
      tier: l.tier,
      winRate: l.winRate,
      totalEntries: l.totalEntries,
      tournamentWins: l.tournamentWins,
    }));

  const uniqueLeaders = leaderStats.length;

  // Latest tournament for hero spotlight
  const latestTournament = recentTournaments[0] ?? null;

  // Map recent tournaments to the shape RecentResults expects
  const recentResults = recentTournaments.map((t) => ({
    id: t.id,
    name: t.name,
    date: t.date,
    playerCount: t.playerCount,
    winner: t.winner
      ? {
          displayName: t.winner.displayName,
          deckId: t.winner.deckId,
          leaderName: t.winner.leaderName,
          leaderSet: t.winner.leaderSet,
          leaderNumber: t.winner.leaderNumber,
        }
      : null,
  }));

  const formatOptions = allFormats.map((f) => ({
    setCode: f.setCode,
    displayName: f.displayName,
    tournamentCount: f.tournamentIds.length,
  }));

  const activeFormatValue = formatParam === "all" ? "all" : (activeFormat?.setCode ?? currentFormat?.setCode ?? "all");

  return (
    <PageTransition>
      <div className="space-y-10 lg:space-y-14">
        {/* Format Selector + Bento Hero */}
        <div className="space-y-3">
          <div className="flex justify-end">
            <FormatSelector
              formats={formatOptions}
              currentFormatCode={currentFormat?.setCode ?? ""}
              value={activeFormatValue}
            />
          </div>
          <HeroStats
            totalTournaments={dashboardStats.totalTournaments}
            uniquePlayers={dashboardStats.uniquePlayerCount}
            uniqueLeaders={uniqueLeaders}
            formatName={activeFormat?.displayName ?? (formatParam === "all" ? "All Time" : null)}
            latestTournament={latestTournament}
          />
        </div>

        {/* Top Meta Leaders — spotlight hover cards */}
        <TopLeaders leaders={topLeaders} />

        {/* Meta Distribution + Recent Events */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <MetaPieChart data={metaShareData} />
          </div>
          <div className="lg:col-span-2">
            <RecentResults results={recentResults} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
