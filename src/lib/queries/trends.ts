import { db } from "@/lib/db";
import { standings, tournaments } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function getMetaTrends() {
  // Get meta share per tournament date
  const trends = await db
    .select({
      tournamentId: standings.tournamentId,
      date: tournaments.date,
      deckId: standings.deckId,
      leaderName: sql<string>`min(${standings.leaderName})`,
      count: sql<number>`count(*)`,
      totalInTournament: tournaments.playerCount,
    })
    .from(standings)
    .innerJoin(tournaments, eq(standings.tournamentId, tournaments.id))
    .where(sql`${standings.deckId} is not null`)
    .groupBy(standings.tournamentId, tournaments.date, standings.deckId, tournaments.playerCount)
    .orderBy(tournaments.date);

  // Group by date
  const byDate: Record<
    string,
    { date: string; leaders: Record<string, { name: string; count: number; total: number }> }
  > = {};

  for (const row of trends) {
    if (!byDate[row.date]) {
      byDate[row.date] = { date: row.date, leaders: {} };
    }
    byDate[row.date].leaders[row.deckId!] = {
      name: row.leaderName || "Unknown",
      count: Number(row.count),
      total: Number(row.totalInTournament) || 0,
    };
  }

  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
}

export async function getWinRateTrends() {
  const trends = await db
    .select({
      date: tournaments.date,
      deckId: standings.deckId,
      leaderName: sql<string>`min(${standings.leaderName})`,
      wins: sql<number>`sum(${standings.wins})`,
      losses: sql<number>`sum(${standings.losses})`,
      ties: sql<number>`sum(${standings.ties})`,
    })
    .from(standings)
    .innerJoin(tournaments, eq(standings.tournamentId, tournaments.id))
    .where(sql`${standings.deckId} is not null`)
    .groupBy(tournaments.date, standings.deckId)
    .orderBy(tournaments.date);

  return trends.map((t) => {
    const wins = Number(t.wins) || 0;
    const losses = Number(t.losses) || 0;
    const ties = Number(t.ties) || 0;
    const total = wins + losses + ties;
    return {
      date: t.date,
      deckId: t.deckId!,
      leaderName: t.leaderName || "Unknown",
      winRate: total > 0 ? wins / total : 0,
    };
  });
}

export async function getDiversityIndex() {
  // Shannon diversity index per tournament
  const tournamentData = await db
    .select({
      tournamentId: standings.tournamentId,
      date: tournaments.date,
      deckId: standings.deckId,
      count: sql<number>`count(*)`,
    })
    .from(standings)
    .innerJoin(tournaments, eq(standings.tournamentId, tournaments.id))
    .where(sql`${standings.deckId} is not null`)
    .groupBy(standings.tournamentId, tournaments.date, standings.deckId)
    .orderBy(tournaments.date);

  // Group by tournament
  const byTournament: Record<string, { date: string; counts: number[] }> = {};
  for (const row of tournamentData) {
    if (!byTournament[row.tournamentId]) {
      byTournament[row.tournamentId] = { date: row.date, counts: [] };
    }
    byTournament[row.tournamentId].counts.push(Number(row.count));
  }

  return Object.entries(byTournament)
    .map(([id, data]) => {
      const total = data.counts.reduce((sum, c) => sum + c, 0);
      const shannon = -data.counts.reduce((sum, c) => {
        const p = c / total;
        return sum + (p > 0 ? p * Math.log(p) : 0);
      }, 0);

      return {
        tournamentId: id,
        date: data.date,
        diversityIndex: shannon,
        uniqueLeaders: data.counts.length,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}
