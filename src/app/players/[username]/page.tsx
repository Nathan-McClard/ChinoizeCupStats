import { getPlayerLeaderboard, getPlayerDetail } from "@/lib/queries/players";
import { PageTransition } from "@/components/ui/page-transition";
import { PlayerHeader } from "@/components/players/player-header";
import { PlayerTournamentHistory } from "@/components/players/player-tournament-history";
import { PlayerLeaderBreakdown } from "@/components/players/player-leader-breakdown";
import { Users } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PlayerDetailPageProps {
  params: Promise<{ username: string }>;
}

export default async function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  const [leaderboard, detail] = await Promise.all([
    getPlayerLeaderboard(),
    getPlayerDetail(decodedUsername),
  ]);

  const player = leaderboard.find((p) => p.player === decodedUsername);

  if (!player) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="rounded-full bg-primary/10 p-6">
            <Users className="w-10 h-10 text-primary/50" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Player Not Found
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            The player you are looking for does not exist or has no tournament data yet.
          </p>
          <Link
            href="/players"
            className="text-sm text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
          >
            Back to Players
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6">
        <PlayerHeader
          displayName={player.displayName}
          country={player.country}
          rank={player.rank}
          totalPoints={player.totalPoints}
          winRate={player.winRate}
          tournamentsPlayed={player.tournamentsPlayed}
          top4Count={player.top4Count}
          bestPlacing={player.bestPlacing}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PlayerTournamentHistory rows={detail} player={decodedUsername} />
          </div>
          <div className="lg:col-span-1">
            <PlayerLeaderBreakdown rows={detail} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
