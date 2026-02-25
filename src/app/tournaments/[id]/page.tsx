import type { Metadata } from "next";
import {
  getTournamentById,
  getTournamentStandings,
} from "@/lib/queries/tournaments";
import { PageTransition } from "@/components/ui/page-transition";
import { StandingsTable } from "@/components/tournaments/standings-table";
import { TournamentMetaPie } from "@/components/tournaments/tournament-meta-pie";
import { TournamentHero } from "@/components/tournaments/tournament-hero";
import { BreadcrumbJsonLd, SportsEventJsonLd } from "@/components/seo/json-ld";
import { GlassCard } from "@/components/ui/glass-card";
import { Trophy } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: TournamentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const tournament = await getTournamentById(id);
  if (!tournament) return { title: "Tournament Not Found" };
  const playerLabel = tournament.playerCount
    ? ` — ${tournament.playerCount} players`
    : "";
  return {
    title: tournament.name,
    description: `Results and standings for ${tournament.name}${playerLabel}.`,
    alternates: { canonical: `/tournaments/${id}` },
    openGraph: { title: tournament.name },
  };
}

interface TournamentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TournamentDetailPage({
  params,
}: TournamentDetailPageProps) {
  const { id } = await params;
  const [tournament, standings] = await Promise.all([
    getTournamentById(id),
    getTournamentStandings(id),
  ]);

  if (!tournament) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="rounded-full bg-primary/10 p-6">
            <Trophy className="w-10 h-10 text-primary/50" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Tournament Not Found
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            The tournament you are looking for does not exist or has not been synced yet.
          </p>
          <Link
            href="/tournaments"
            className="text-sm text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
          >
            Back to Tournaments
          </Link>
        </div>
      </PageTransition>
    );
  }

  const winner = standings.find((s) => s.placing === 1 && !s.dropRound);
  const topCut = standings.filter((s) => (s.placing ?? 99) <= 8 && !s.dropRound);
  const totalGames = standings.reduce((sum, s) => sum + s.wins + s.losses + s.ties, 0);

  return (
    <PageTransition>
      <BreadcrumbJsonLd
        items={[
          { name: "Tournaments", href: "/tournaments" },
          { name: tournament.name, href: `/tournaments/${id}` },
        ]}
      />
      <SportsEventJsonLd
        name={tournament.name}
        date={tournament.date}
        url={`/tournaments/${id}`}
        playerCount={tournament.playerCount}
      />
      <div className="space-y-6">
        {/* Back link */}
        <Link
          href="/tournaments"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; All Tournaments
        </Link>

        {/* Hero section */}
        <TournamentHero
          tournament={tournament}
          winner={winner ?? null}
          topCut={topCut}
          totalGames={totalGames}
        />

        {/* Standings + Meta Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StandingsTable standings={standings} />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <TournamentMetaPie standings={standings} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
