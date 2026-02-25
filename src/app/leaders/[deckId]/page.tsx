import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLeaderStats, getLeaderNameMap, getLeaderDetail, getLeaderTrends, getMatchupData } from "@/lib/queries/leaders";
import { resolveFormatFilter, getAllFormats } from "@/lib/queries/formats";
import type { MatchupMatrix } from "@/lib/queries/leaders";
import { getTopDecklists } from "@/lib/queries/decklists";
import { getDecklistForPlayer } from "@/lib/queries/cards";
import { PageTransition } from "@/components/ui/page-transition";
import { LeaderHero } from "@/components/leaders/leader-hero";
import { PerformanceChart } from "@/components/leaders/performance-chart";
import { MatchupChart } from "@/components/leaders/matchup-chart";
import { BestDecklists } from "@/components/leaders/best-decklists";

export const dynamic = "force-dynamic";

interface LeaderDetailPageProps {
  params: Promise<{ deckId: string }>;
}

export default async function LeaderDetailPage({ params }: LeaderDetailPageProps) {
  const { deckId } = await params;
  const decodedDeckId = decodeURIComponent(deckId);

  // Use current format for tier/stat calculations, all-time for detail/trends
  const { tournamentIds, currentFormatCode } = await resolveFormatFilter();

  const [allLeaders, leadersMap, detail, trends, matchups, decklists, allFormats] = await Promise.all([
    getLeaderStats(tournamentIds),
    getLeaderNameMap(),
    getLeaderDetail(decodedDeckId),
    getLeaderTrends(decodedDeckId),
    getMatchupData(decodedDeckId),
    getTopDecklists(decodedDeckId, 20),
    getAllFormats(),
  ]);

  // Enrich decklists with card data for preview strips
  const decklistsWithCards = await Promise.all(
    decklists.map(async (d) => {
      const cards = await getDecklistForPlayer(d.tournamentId, d.player);
      return {
        ...d,
        cards: cards.map((c) => ({
          cardType: c.cardType,
          cardName: c.cardName,
          cardSet: c.cardSet,
          cardNumber: c.cardNumber,
          count: c.count,
        })),
      };
    }),
  );

  // Find this leader in the stats
  const leader = allLeaders.find((l) => l.deckId === decodedDeckId);

  if (!leader) {
    notFound();
  }

  // Compute rank among qualified leaders (sorted by composite score)
  const qualified = allLeaders.filter((l) => l.totalEntries >= 5);
  const rank = qualified.findIndex((l) => l.deckId === decodedDeckId) + 1 || null;

  // Convert single-leader matchup data into matrix format (one row)
  const opponentIds = new Set(matchups.map((m) => m.opponentDeckId));
  const matrix: MatchupMatrix = {
    [decodedDeckId]: Object.fromEntries(
      matchups.map((m) => [
        m.opponentDeckId,
        { wins: m.wins, losses: m.losses, ties: m.ties, total: m.total, winRate: m.winRate },
      ])
    ),
  };

  // Column leaders: all opponents with matchup data, sorted by play rate
  const matrixLeaders = allLeaders.filter(
    (l) => l.deckId === decodedDeckId || opponentIds.has(l.deckId)
  );
  if (!matrixLeaders.find((l) => l.deckId === decodedDeckId)) {
    matrixLeaders.unshift(leader);
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/tier-list"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tier List
        </Link>

        {/* Hero Section */}
        <LeaderHero
          leaderName={leader.leaderName}
          deckId={leader.deckId}
          leaderSet={leader.leaderSet}
          leaderNumber={leader.leaderNumber}
          rank={rank}
          winRate={leader.winRate}
          top4Rate={leader.top4Rate}
          tournamentWins={leader.tournamentWins}
          avgPlacing={leader.avgPlacing}
          totalEntries={leader.totalEntries}
          totalWins={leader.totalWins}
          totalLosses={leader.totalLosses}
          totalTies={leader.totalTies}
          playRate={leader.playRate}
          compositeScore={leader.compositeScore}
        />

        {/* Matchups Heatmap */}
        <MatchupChart
          matrix={matrix}
          leaders={matrixLeaders}
          currentDeckId={decodedDeckId}
        />

        {/* Performance and Best Decklists Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceChart trends={trends} />
          <BestDecklists
            decklists={decklistsWithCards}
            deckId={decodedDeckId}
            formats={allFormats.map((f) => ({
              setCode: f.setCode,
              displayName: f.displayName,
              tournamentIds: f.tournamentIds,
            }))}
            currentFormatCode={currentFormatCode}
          />
        </div>
      </div>
    </PageTransition>
  );
}
