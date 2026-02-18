export const dynamic = "force-dynamic";

import { getMetaTrends, getWinRateTrends } from "@/lib/queries/trends";
import { getLeaderStats } from "@/lib/queries/leaders";
import {
  getCurrentFormat,
  getAllFormats,
  getFormatBySetCode,
} from "@/lib/queries/formats";
import { PageTransition } from "@/components/ui/page-transition";
import { FormatSelector } from "@/components/ui/format-selector";
import { MetaShareStacked } from "@/components/trends/meta-share-stacked";
import { WinrateTrend } from "@/components/trends/winrate-trend";

interface TrendsPageProps {
  searchParams: Promise<{ format?: string }>;
}

export default async function TrendsPage({ searchParams }: TrendsPageProps) {
  const params = await searchParams;

  const [currentFormat, allFormats] = await Promise.all([
    getCurrentFormat(),
    getAllFormats(),
  ]);

  let activeFormat = currentFormat;
  if (params.format === "all") {
    activeFormat = null;
  } else if (params.format && params.format !== currentFormat?.setCode) {
    activeFormat = await getFormatBySetCode(params.format);
  }

  const formatTournamentIds = activeFormat?.tournamentIds;

  const [metaTrends, winRateTrends, leaderStats] = await Promise.all([
    getMetaTrends(formatTournamentIds),
    getWinRateTrends(formatTournamentIds),
    getLeaderStats(formatTournamentIds),
  ]);

  const sortedLeaders = [...leaderStats].sort(
    (a, b) => b.totalEntries - a.totalEntries,
  );

  const topLeaders8 = sortedLeaders.slice(0, 8).map((l) => ({
    deckId: l.deckId,
    leaderName: l.leaderName,
  }));

  const topLeaders6 = sortedLeaders.slice(0, 6).map((l) => ({
    deckId: l.deckId,
    leaderName: l.leaderName,
  }));

  const formatOptions = allFormats.map((f) => ({
    setCode: f.setCode,
    displayName: f.displayName,
    tournamentCount: f.tournamentIds.length,
  }));

  const activeFormatValue =
    params.format === "all"
      ? "all"
      : (activeFormat?.setCode ?? currentFormat?.setCode ?? "all");

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-1">
              Historical
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-foreground">
              Meta Trends
            </h1>
          </div>
          <FormatSelector
            formats={formatOptions}
            currentFormatCode={currentFormat?.setCode ?? ""}
            value={activeFormatValue}
          />
        </div>

        {/* Meta Share Over Time */}
        <div className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--accent-line), transparent)",
            }}
          />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Meta Share Over Time
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Play rate distribution of top leaders across tournaments
          </p>
          <MetaShareStacked data={metaTrends} topLeaders={topLeaders8} />
        </div>

        {/* Win Rate Trends */}
        <div className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--accent-line), transparent)",
            }}
          />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Win Rate Trends
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Per-tournament win rates for the most played leaders
          </p>
          <WinrateTrend data={winRateTrends} topLeaders={topLeaders6} />
        </div>
      </div>
    </PageTransition>
  );
}
