import type { Metadata } from "next";
import { getRecentTournaments } from "@/lib/queries/tournaments";
import { isSpecialEvent } from "@/lib/config/special-events";
import { PageTransition } from "@/components/ui/page-transition";
import { TournamentList } from "@/components/tournaments/tournament-list";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tournaments",
  description:
    "Browse all ChinoizeCup One Piece TCG tournament results, winners, and standings.",
  alternates: { canonical: "/tournaments" },
};

export default async function TournamentsPage() {
  const tournaments = await getRecentTournaments(100);

  const listData = tournaments.map((t) => ({
    id: t.id,
    name: t.name,
    date: t.date,
    playerCount: t.playerCount,
    isSpecialEvent: isSpecialEvent(t.name),
    winner: t.winner
      ? {
          displayName: t.winner.displayName,
          leaderName: t.winner.leaderName,
          leaderSet: t.winner.leaderSet,
          leaderNumber: t.winner.leaderNumber,
          deckId: t.winner.deckId,
          wins: t.winner.wins,
          losses: t.winner.losses,
        }
      : null,
  }));

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Tournament History
            </h1>
            <p className="text-sm text-muted-foreground">
              {tournaments.length} events tracked
            </p>
          </div>
        </div>

        {/* Tournament grid */}
        <TournamentList tournaments={listData} />
      </div>
    </PageTransition>
  );
}
