import { db } from "@/lib/db";
import { tournaments, standings } from "@/lib/db/schema";
import { desc, eq, count, sql, and, isNull, inArray } from "drizzle-orm";

export async function getAllTournaments() {
  return db.query.tournaments.findMany({
    orderBy: [desc(tournaments.date)],
  });
}

export async function getTournamentById(id: string) {
  return db.query.tournaments.findFirst({
    where: eq(tournaments.id, id),
  });
}

export async function getTournamentStandings(tournamentId: string) {
  return db.query.standings.findMany({
    where: eq(standings.tournamentId, tournamentId),
    orderBy: [standings.placing],
  });
}

export async function getDashboardStats(tournamentIds?: string[]) {
  const tFilterTournaments = tournamentIds && tournamentIds.length > 0
    ? inArray(tournaments.id, tournamentIds)
    : undefined;
  const tFilterStandings = tournamentIds && tournamentIds.length > 0
    ? inArray(standings.tournamentId, tournamentIds)
    : undefined;

  const allTournaments = await db
    .select()
    .from(tournaments)
    .where(tFilterTournaments);
  const totalTournaments = allTournaments.length;

  // Unique players
  const uniquePlayers = await db
    .selectDistinct({ player: standings.player })
    .from(standings)
    .where(tFilterStandings);

  // Most recent tournament winner (exclude dropped players)
  const winnerConditions = [eq(standings.placing, 1), isNull(standings.dropRound)];
  if (tFilterStandings) winnerConditions.push(tFilterStandings);

  const recentResults = await db
    .select()
    .from(standings)
    .innerJoin(tournaments, eq(standings.tournamentId, tournaments.id))
    .where(and(...winnerConditions))
    .orderBy(desc(tournaments.date))
    .limit(10);

  return {
    totalTournaments,
    uniquePlayerCount: uniquePlayers.length,
    recentWinners: recentResults.map((r) => ({
      tournament: r.tournaments,
      standing: r.standings,
    })),
  };
}

export async function getRecentTournaments(limit = 10, tournamentIds?: string[]) {
  const tFilter = tournamentIds && tournamentIds.length > 0
    ? inArray(tournaments.id, tournamentIds)
    : undefined;

  const results = await db
    .select()
    .from(tournaments)
    .where(tFilter)
    .orderBy(desc(tournaments.date))
    .limit(limit);

  // Get winners for each (exclude dropped players)
  const withWinners = await Promise.all(
    results.map(async (t) => {
      const winner = await db.query.standings.findFirst({
        where: and(eq(standings.tournamentId, t.id), isNull(standings.dropRound)),
        orderBy: [standings.placing],
      });
      return { ...t, winner };
    })
  );

  return withWinners;
}
