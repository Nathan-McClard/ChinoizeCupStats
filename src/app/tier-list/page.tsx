import type { Metadata } from "next";
import { getLeaderStats } from "@/lib/queries/leaders";
import { resolveFormatFilter } from "@/lib/queries/formats";
import { LeaderRankings } from "@/components/tier-list/leader-rankings";
import { RankingInfo } from "@/components/tier-list/ranking-info";
import { PageTransition } from "@/components/ui/page-transition";
import { FormatSelector } from "@/components/ui/format-selector";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tier List",
  description:
    "One Piece TCG leader tier rankings based on win rate, top cut rate, and tournament wins across ChinoizeCup events.",
  alternates: { canonical: "/tier-list" },
};

interface TierListPageProps {
  searchParams: Promise<{ format?: string }>;
}

export default async function TierListPage({
  searchParams,
}: TierListPageProps) {
  const params = await searchParams;

  const { tournamentIds, activeFormatValue, formatOptions, currentFormatCode } =
    await resolveFormatFilter(params.format);

  const leaders = await getLeaderStats(tournamentIds);

  return (
    <PageTransition>
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-1">
              Meta Rankings
            </p>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-foreground">
                Rankings
              </h1>
              <RankingInfo />
            </div>
          </div>
          <FormatSelector
            formats={formatOptions}
            currentFormatCode={currentFormatCode}
            value={activeFormatValue}
          />
        </div>

        {/* Rankings Table */}
        <LeaderRankings leaders={leaders} />
      </div>
    </PageTransition>
  );
}
