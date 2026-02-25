export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getMostPlayedCards } from "@/lib/queries/cards";

export const metadata: Metadata = {
  title: "Card Analytics",
  description:
    "Most played cards across ChinoizeCup One Piece TCG tournaments with usage stats and type breakdowns.",
  alternates: { canonical: "/cards" },
};
import { resolveFormatFilter } from "@/lib/queries/formats";
import { PageTransition } from "@/components/ui/page-transition";
import { FormatSelector } from "@/components/ui/format-selector";
import { GlassCard } from "@/components/ui/glass-card";
import { MostPlayedTable } from "@/components/cards/most-played-table";
import { CardTypeChart } from "@/components/cards/card-type-chart";
import { Layers, Copy } from "lucide-react";

interface CardsPageProps {
  searchParams: Promise<{ format?: string }>;
}

export default async function CardsPage({ searchParams }: CardsPageProps) {
  const params = await searchParams;

  const { tournamentIds, activeFormat, activeFormatValue, formatOptions, currentFormatCode } =
    await resolveFormatFilter(params.format);

  const cards = await getMostPlayedCards(100, tournamentIds);

  const displayFormatName = activeFormat?.displayName ?? (params.format === "all" ? "All Time" : null);

  const totalUniqueCards = cards.length;
  const avgCopiesPerCard =
    cards.length > 0
      ? cards.reduce((sum, c) => sum + Number(c.avgCopies), 0) / cards.length
      : 0;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="gradient-text">Card Analytics</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Most played cards across ChinoizeCup tournaments
              {displayFormatName && <span className="text-primary font-medium"> — {displayFormatName} Format</span>}
            </p>
          </div>
          <FormatSelector
            formats={formatOptions}
            currentFormatCode={currentFormatCode}
            value={activeFormatValue}
          />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
          <GlassCard
            className="relative overflow-hidden p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 pointer-events-none" />
            <div className="relative flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Unique Cards</p>
                <p className="text-3xl font-bold text-foreground">
                  {totalUniqueCards}
                </p>
              </div>
              <div className="rounded-lg bg-black/[0.05] dark:bg-white/[0.05] p-2.5">
                <Layers className="h-5 w-5 text-primary" />
              </div>
            </div>
          </GlassCard>

          <GlassCard
            className="relative overflow-hidden p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-accent/5 pointer-events-none" />
            <div className="relative flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Avg Copies / Card
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {avgCopiesPerCard.toFixed(1)}
                </p>
              </div>
              <div className="rounded-lg bg-black/[0.05] dark:bg-white/[0.05] p-2.5">
                <Copy className="h-5 w-5 text-accent" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <MostPlayedTable cards={cards} />
          </div>
          <div className="lg:col-span-2">
            <CardTypeChart cards={cards} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
