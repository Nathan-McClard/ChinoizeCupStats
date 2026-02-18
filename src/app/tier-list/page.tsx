import { getLeaderStats } from "@/lib/queries/leaders";
import {
  getCurrentFormat,
  getAllFormats,
  getFormatBySetCode,
} from "@/lib/queries/formats";
import { LeaderRankings } from "@/components/tier-list/leader-rankings";
import { RankingInfo } from "@/components/tier-list/ranking-info";
import { PageTransition } from "@/components/ui/page-transition";
import { FormatSelector } from "@/components/ui/format-selector";

export const dynamic = "force-dynamic";

interface TierListPageProps {
  searchParams: Promise<{ format?: string }>;
}

export default async function TierListPage({
  searchParams,
}: TierListPageProps) {
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

  const leaders = await getLeaderStats(activeFormat?.tournamentIds);

  const formatOptions = allFormats.map((f) => ({
    setCode: f.setCode,
    displayName: f.displayName,
    tournamentCount: f.tournamentIds.length,
  }));

  const activeFormatValue =
    formatParam === "all"
      ? "all"
      : (activeFormat?.setCode ?? currentFormat?.setCode ?? "all");

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
            currentFormatCode={currentFormat?.setCode ?? ""}
            value={activeFormatValue}
          />
        </div>

        {/* Rankings Table */}
        <LeaderRankings leaders={leaders} />
      </div>
    </PageTransition>
  );
}
