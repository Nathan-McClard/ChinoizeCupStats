import { cache } from "react";
import { db } from "@/lib/db";
import { standings, tournaments } from "@/lib/db/schema";
import { sql, eq, desc, and, inArray } from "drizzle-orm";

export interface PlayerLeaderboardRow {
  player: string;
  displayName: string;
  country: string;
  totalPoints: number;
  totalWins: number;
  totalLosses: number;
  totalTies: number;
  tournamentsPlayed: number;
  winRate: number;
  bestPlacing: number;
  top4Count: number;
  mostPlayedLeaderName: string;
  rank: number;
}

export const getPlayerLeaderboard = cache(async (tournamentIds?: string[]): Promise<PlayerLeaderboardRow[]> => {
  const tFilter = tournamentIds && tournamentIds.length > 0
    ? inArray(standings.tournamentId, tournamentIds)
    : undefined;

  const rawStats = await db
    .select({
      player: standings.player,
      displayName: sql<string>`max(${standings.displayName})`,
      country: sql<string>`max(${standings.country})`,
      totalPoints: sql<number>`sum(case
        when ${standings.dropRound} is not null then 0
        when ${standings.placing} = 1 then 16
        when ${standings.placing} = 2 then 12
        when ${standings.placing} <= 4 then 8
        when ${standings.placing} <= 8 then 6
        when ${standings.placing} <= 16 then 4
        when ${standings.placing} <= 32 then 2
        when ${standings.placing} <= 64 then 1
        else 0
      end)`,
      totalWins: sql<number>`sum(${standings.wins})`,
      totalLosses: sql<number>`sum(${standings.losses})`,
      totalTies: sql<number>`sum(${standings.ties})`,
      tournamentsPlayed: sql<number>`count(*)`,
      bestPlacing: sql<number>`min(case when ${standings.dropRound} is null then ${standings.placing} end)`,
      top4Count: sql<number>`sum(case when ${standings.placing} <= 4 and ${standings.dropRound} is null then 1 else 0 end)`,
      mostPlayedLeaderName: sql<string>`mode() within group (order by ${standings.leaderName})`,
    })
    .from(standings)
    .where(tFilter)
    .groupBy(standings.player);

  const players: PlayerLeaderboardRow[] = rawStats.map((r) => {
    const wins = Number(r.totalWins) || 0;
    const losses = Number(r.totalLosses) || 0;
    const ties = Number(r.totalTies) || 0;
    const totalGames = wins + losses + ties;

    return {
      player: r.player,
      displayName: r.displayName || r.player,
      country: r.country || "",
      totalPoints: Number(r.totalPoints) || 0,
      totalWins: wins,
      totalLosses: losses,
      totalTies: ties,
      tournamentsPlayed: Number(r.tournamentsPlayed) || 0,
      winRate: totalGames > 0 ? wins / totalGames : 0,
      bestPlacing: Number(r.bestPlacing) || 0,
      top4Count: Number(r.top4Count) || 0,
      mostPlayedLeaderName: r.mostPlayedLeaderName || "Unknown",
      rank: 0,
    };
  });

  // Sort by points desc, win rate desc as tiebreaker
  players.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.winRate - a.winRate;
  });

  // Assign ranks
  players.forEach((p, i) => {
    p.rank = i + 1;
  });

  return players;
});

export async function getPlayerDetail(player: string) {
  const playerStandings = await db
    .select({
      tournamentId: standings.tournamentId,
      tournamentName: tournaments.name,
      tournamentDate: tournaments.date,
      playerCount: tournaments.playerCount,
      placing: standings.placing,
      wins: standings.wins,
      losses: standings.losses,
      ties: standings.ties,
      dropRound: standings.dropRound,
      deckId: standings.deckId,
      deckName: standings.deckName,
      leaderName: standings.leaderName,
      leaderSet: standings.leaderSet,
      leaderNumber: standings.leaderNumber,
    })
    .from(standings)
    .innerJoin(tournaments, eq(standings.tournamentId, tournaments.id))
    .where(eq(standings.player, player))
    .orderBy(desc(tournaments.date));

  return playerStandings;
}
