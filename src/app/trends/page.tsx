import { getMetaTrends, getWinRateTrends, getDiversityIndex } from "@/lib/queries/trends";
import { getLeaderStats } from "@/lib/queries/leaders";
import { getCurrentFormat } from "@/lib/queries/formats";
import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { MetaShareStacked } from "@/components/trends/meta-share-stacked";
import { WinrateTrend } from "@/components/trends/winrate-trend";
import { DiversityIndex } from "@/components/trends/diversity-index";

export const dynamic = "force-dynamic";

export default async function TrendsPage() {
  // Use current format for leader selection, all-time for trend data
  const format = await getCurrentFormat();

  const [metaTrends, winRateTrends, diversityData, leaderStats] =
    await Promise.all([
      getMetaTrends(),
      getWinRateTrends(),
      getDiversityIndex(),
      getLeaderStats(format?.tournamentIds),
    ]);

  // Compute top leaders sorted by totalEntries descending
  const sortedLeaders = [...leaderStats].sort(
    (a, b) => b.totalEntries - a.totalEntries
  );

  const topLeaders8 = sortedLeaders.slice(0, 8).map((l) => ({
    deckId: l.deckId,
    leaderName: l.leaderName,
  }));

  const topLeaders6 = sortedLeaders.slice(0, 6).map((l) => ({
    deckId: l.deckId,
    leaderName: l.leaderName,
  }));

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Meta Trends</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            How the ChinoizeCup meta has evolved over time
          </p>
        </div>

        {/* Meta Share Over Time */}
        <GlassCard
          className="p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Meta Share Over Time
          </h3>
          <MetaShareStacked data={metaTrends} topLeaders={topLeaders8} />
        </GlassCard>

        {/* Win Rate Trends */}
        <GlassCard
          className="p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Win Rate Trends
          </h3>
          <WinrateTrend data={winRateTrends} topLeaders={topLeaders6} />
        </GlassCard>

        {/* Meta Diversity */}
        <GlassCard
          className="p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Meta Diversity
          </h3>
          <DiversityIndex data={diversityData} />
        </GlassCard>
      </div>
    </PageTransition>
  );
}
