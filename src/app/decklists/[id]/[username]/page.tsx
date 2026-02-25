export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getDecklistEntry } from "@/lib/queries/decklists";
import { getDecklistForPlayer } from "@/lib/queries/cards";
import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { LeaderIcon } from "@/components/ui/leader-icon";
import { DecklistVisual } from "@/components/decklists/decklist-visual";
import { CopyForSim } from "@/components/decklists/copy-for-sim";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { SearchX } from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";

export async function generateMetadata({
  params,
}: DecklistDetailPageProps): Promise<Metadata> {
  const { id, username } = await params;
  const decodedUsername = decodeURIComponent(username);
  const entry = await getDecklistEntry(id, decodedUsername);
  if (!entry) return { title: "Decklist Not Found" };
  const leader = entry.leaderName || "Unknown Leader";
  return {
    title: `${entry.displayName}'s ${leader} Decklist`,
    description: `${entry.displayName}'s ${leader} decklist from ${entry.tournamentName} — #${entry.placing ?? "?"}, ${entry.wins}W-${entry.losses}L.`,
    alternates: { canonical: `/decklists/${id}/${username}` },
    openGraph: { title: `${entry.displayName} — ${leader}` },
  };
}

interface DecklistDetailPageProps {
  params: Promise<{ id: string; username: string }>;
}

export default async function DecklistDetailPage({
  params,
}: DecklistDetailPageProps) {
  const { id, username } = await params;
  const decodedUsername = decodeURIComponent(username);

  const [entry, cards] = await Promise.all([
    getDecklistEntry(id, decodedUsername),
    getDecklistForPlayer(id, decodedUsername),
  ]);

  if (!entry) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="rounded-full bg-primary/10 p-6">
            <SearchX className="w-10 h-10 text-primary/50" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Decklist Not Found
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            The decklist you are looking for does not exist or has not been
            synced yet.
          </p>
          <Link
            href="/decklists"
            className="text-sm text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
          >
            Back to Decklists
          </Link>
        </div>
      </PageTransition>
    );
  }

  const totalCards = cards
    .filter((c) => c.cardType !== "Leader")
    .reduce((sum, c) => sum + c.count, 0);

  return (
    <PageTransition>
      <BreadcrumbJsonLd
        items={[
          { name: "Decklists", href: "/decklists" },
          { name: `${entry.displayName}'s Decklist`, href: `/decklists/${id}/${username}` },
        ]}
      />
      <div className="space-y-6">
        {/* Back link */}
        <Link
          href={`/tournaments/${entry.tournamentId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; {entry.tournamentName}
        </Link>

        {/* Player Header */}
        <GlassCard
          className="relative overflow-hidden p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />

          <div className="relative flex items-start gap-4">
            <LeaderIcon
              set={entry.leaderSet || ""}
              number={entry.leaderNumber || ""}
              name={entry.leaderName ?? undefined}
              size={72}
              className="shrink-0"
            />

            <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold text-foreground truncate">
                    {entry.displayName}
                  </h1>
                  <span className="shrink-0 text-lg font-bold font-data text-muted-foreground">
                    #{entry.placing ?? 0}
                  </span>
                  <span className="text-muted-foreground/40 hidden sm:inline">&middot;</span>
                  <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{format(parseISO(entry.tournamentDate), "MMM d, yyyy")}</span>
                    <span>
                      <span className="text-success font-medium">{entry.wins}W</span>
                      <span className="mx-0.5">-</span>
                      <span className="text-error font-medium">{entry.losses}L</span>
                      {entry.ties > 0 && (
                        <>
                          <span className="mx-0.5">-</span>
                          <span className="text-warning font-medium">{entry.ties}T</span>
                        </>
                      )}
                    </span>
                    <span>{totalCards} cards</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {entry.leaderName || "Unknown Leader"}
                  {entry.deckName &&
                    entry.deckName !== entry.leaderName && (
                      <span className="text-muted-foreground/60">
                        {" "}
                        &middot; {entry.deckName}
                      </span>
                    )}
                  <span className="sm:hidden inline">
                    {" "}&middot; {format(parseISO(entry.tournamentDate), "MMM d, yyyy")}
                    {" "}&middot;{" "}
                    <span className="text-success font-medium">{entry.wins}W</span>
                    -<span className="text-error font-medium">{entry.losses}L</span>
                    {entry.ties > 0 && <>-<span className="text-warning font-medium">{entry.ties}T</span></>}
                  </span>
                </p>
              </div>

              {cards.length > 0 && <CopyForSim cards={cards} />}
            </div>
          </div>
        </GlassCard>

        {/* Decklist */}
        {cards.length > 0 ? (
          <GlassCard className="p-5 sm:p-6">
            <DecklistVisual cards={cards} />
          </GlassCard>
        ) : (
          <GlassCard className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <SearchX className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No card data available
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              The decklist cards for this entry have not been synced yet.
            </p>
          </GlassCard>
        )}
      </div>
    </PageTransition>
  );
}
