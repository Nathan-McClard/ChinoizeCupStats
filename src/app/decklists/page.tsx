export const dynamic = "force-dynamic";

import Link from "next/link";
import { getGroupedDecklists } from "@/lib/queries/decklists";
import { getLeaderStats } from "@/lib/queries/leaders";
import {
  getCurrentFormat,
  getAllFormats,
  getFormatBySetCode,
} from "@/lib/queries/formats";
import { PageTransition } from "@/components/ui/page-transition";
import { FormatSelector } from "@/components/ui/format-selector";
import { LeaderPicker } from "@/components/decklists/leader-picker";
import { ArchetypeList } from "@/components/decklists/archetype-list";
import { LeaderIcon } from "@/components/ui/leader-icon";

interface DecklistsPageProps {
  searchParams: Promise<{
    format?: string;
    deckId?: string;
  }>;
}

export default async function DecklistsPage({
  searchParams,
}: DecklistsPageProps) {
  const params = await searchParams;

  // Format resolution (same pattern as tier-list/page.tsx)
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

  const formatOptions = allFormats.map((f) => ({
    setCode: f.setCode,
    displayName: f.displayName,
    tournamentCount: f.tournamentIds.length,
  }));

  const activeFormatValue =
    params.format === "all"
      ? "all"
      : (activeFormat?.setCode ?? currentFormat?.setCode ?? "all");

  // Format param for preserving in links
  const formatParam =
    params.format === "all" ? "all" : params.format || undefined;

  if (params.deckId) {
    // ── Archetype mode ──────────────────────────────────────────────
    const [archetypes, leaderStats] = await Promise.all([
      getGroupedDecklists(params.deckId, formatTournamentIds),
      getLeaderStats(formatTournamentIds),
    ]);

    const leader = leaderStats.find((l) => l.deckId === params.deckId);

    const changeLeaderHref = formatParam
      ? `/decklists?format=${formatParam}`
      : "/decklists";

    return (
      <PageTransition>
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-1">
                Current
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-foreground">
                Decklists
              </h1>
            </div>
            <FormatSelector
              formats={formatOptions}
              currentFormatCode={currentFormat?.setCode ?? ""}
              value={activeFormatValue}
            />
          </div>

          {/* Leader bar */}
          <div className="flex items-center gap-3">
            <LeaderIcon
              set={leader?.leaderSet || ""}
              number={leader?.leaderNumber || ""}
              name={leader?.leaderName}
              size={44}
            />
            <div>
              <p className="text-base font-semibold text-foreground">
                {leader?.leaderName || params.deckId}
              </p>
              <Link
                href={changeLeaderHref}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Change Leader
              </Link>
            </div>
          </div>

          {/* Archetypes */}
          <ArchetypeList archetypes={archetypes} />
        </div>
      </PageTransition>
    );
  }

  // ── Landing mode — leader picker ──────────────────────────────────
  const leaderStats = await getLeaderStats(formatTournamentIds);

  const leaders = leaderStats
    .filter((l) => l.totalEntries > 0)
    .sort((a, b) => b.totalEntries - a.totalEntries)
    .map((l) => ({
      deckId: l.deckId,
      leaderName: l.leaderName,
      leaderSet: l.leaderSet,
      leaderNumber: l.leaderNumber,
      totalEntries: l.totalEntries,
      playRate: l.playRate,
    }));

  return (
    <PageTransition>
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-1">
              Browse
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-foreground">
              Decklists
            </h1>
          </div>
          <FormatSelector
            formats={formatOptions}
            currentFormatCode={currentFormat?.setCode ?? ""}
            value={activeFormatValue}
          />
        </div>

        {/* Subheader */}
        <p className="text-sm text-muted-foreground">
          Select a leader to explore decklists
        </p>

        {/* Leader picker grid */}
        <LeaderPicker leaders={leaders} formatParam={formatParam} />
      </div>
    </PageTransition>
  );
}
