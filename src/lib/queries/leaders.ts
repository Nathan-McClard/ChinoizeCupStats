import { db } from "@/lib/db";
import { standings, tournaments, pairings } from "@/lib/db/schema";
import { eq, sql, desc, and, or, inArray } from "drizzle-orm";

export interface LeaderStats {
  deckId: string;
  leaderName: string;
  leaderSet: string;
  leaderNumber: string;
  totalEntries: number;
  totalWins: number;
  totalLosses: number;
  totalTies: number;
  winRate: number;
  avgPlacing: number;
  top4Count: number;
  top4Rate: number;
  weightedTop4Score: number;
  tournamentWins: number;
  playRate: number;
  conversionRate: number;
  normalizedPlacing: number;
  tier: "S" | "A" | "B" | "C" | "U";
  compositeScore: number;
}

export async function getLeaderStats(tournamentIds?: string[]): Promise<LeaderStats[]> {
  const tFilter = tournamentIds && tournamentIds.length > 0
    ? inArray(standings.tournamentId, tournamentIds)
    : undefined;

  // Get total entries across tournaments for play rate calculation
  const totalEntries = await db
    .select({ count: sql<number>`count(*)` })
    .from(standings)
    .where(tFilter);
  const totalCount = Number(totalEntries[0]?.count) || 1;

  // Aggregate stats per leader (deckId)
  const rawStats = await db
    .select({
      deckId: standings.deckId,
      leaderName: sql<string>`min(${standings.leaderName})`,
      leaderSet: sql<string>`min(${standings.leaderSet})`,
      leaderNumber: sql<string>`min(${standings.leaderNumber})`,
      totalEntries: sql<number>`count(*)`,
      totalWins: sql<number>`sum(${standings.wins})`,
      totalLosses: sql<number>`sum(${standings.losses})`,
      totalTies: sql<number>`sum(${standings.ties})`,
      avgPlacing: sql<number>`avg(case when ${standings.dropRound} is null then ${standings.placing} end)`,
      top4Count: sql<number>`sum(case when ${standings.placing} <= 4 and ${standings.dropRound} is null then 1 else 0 end)`,
      weightedTop4Points: sql<number>`sum(case when ${standings.placing} = 1 and ${standings.dropRound} is null then 4 when ${standings.placing} = 2 and ${standings.dropRound} is null then 3 when ${standings.placing} = 3 and ${standings.dropRound} is null then 2 when ${standings.placing} = 4 and ${standings.dropRound} is null then 1 else 0 end)`,
      tournamentWins: sql<number>`sum(case when ${standings.placing} = 1 and ${standings.dropRound} is null then 1 else 0 end)`,
    })
    .from(standings)
    .where(and(sql`${standings.deckId} is not null`, tFilter))
    .groupBy(standings.deckId);

  const MIN_ENTRIES = 5;

  const leaders: LeaderStats[] = rawStats.map((r) => {
    // Coerce SQL aggregates to numbers (PostgreSQL bigint/numeric come back as strings)
    const entries = Number(r.totalEntries) || 0;
    const wins = Number(r.totalWins) || 0;
    const losses = Number(r.totalLosses) || 0;
    const ties = Number(r.totalTies) || 0;
    const avgPlac = Number(r.avgPlacing) || 0;
    const t4Count = Number(r.top4Count) || 0;
    const t4Points = Number(r.weightedTop4Points) || 0;
    const tWins = Number(r.tournamentWins) || 0;

    const totalGames = wins + losses + ties;
    const winRate = totalGames > 0 ? wins / totalGames : 0;
    const top4Rate = entries > 0 ? t4Count / entries : 0;
    const weightedTop4Score = entries > 0 ? t4Points / (4 * entries) : 0;
    const playRate = entries / totalCount;
    const conversionRate = t4Count > 0 ? tWins / t4Count : 0;
    const normalizedPlacing = Math.max(0, Math.min(1,
      1 - (avgPlac - 1) / 63
    ));

    return {
      deckId: r.deckId!,
      leaderName: r.leaderName || "Unknown",
      leaderSet: r.leaderSet || "",
      leaderNumber: r.leaderNumber || "",
      totalEntries: entries,
      totalWins: wins,
      totalLosses: losses,
      totalTies: ties,
      winRate,
      avgPlacing: avgPlac,
      top4Count: t4Count,
      top4Rate,
      weightedTop4Score,
      tournamentWins: tWins,
      playRate,
      conversionRate,
      normalizedPlacing,
      compositeScore: 0, // computed below after normalization
      tier: "U" as const, // Will be assigned below for qualified leaders
    };
  });

  // Normalize tournament wins to 0-1 scale for composite score
  const maxTournamentWins = Math.max(1, ...leaders.map((l) => l.tournamentWins));
  for (const leader of leaders) {
    const normalizedWins = leader.tournamentWins / maxTournamentWins;
    leader.compositeScore =
      leader.winRate * 0.40 +
      leader.top4Rate * 0.30 +
      normalizedWins * 0.20 +
      leader.playRate * 0.10;
  }

  // Split into qualified (≥5 entries) and insufficient (<5 entries)
  const qualified = leaders.filter((l) => l.totalEntries >= MIN_ENTRIES);
  const insufficient = leaders.filter((l) => l.totalEntries < MIN_ENTRIES);

  // Sort qualified by composite score and assign tiers
  qualified.sort((a, b) => b.compositeScore - a.compositeScore);

  const total = qualified.length;
  qualified.forEach((leader, i) => {
    const percentile = 1 - i / total;
    if (percentile >= 0.9) leader.tier = "S";
    else if (percentile >= 0.65) leader.tier = "A";
    else if (percentile >= 0.35) leader.tier = "B";
    else leader.tier = "C";
  });

  // Sort insufficient by composite score too, but keep tier as "U"
  insufficient.sort((a, b) => b.compositeScore - a.compositeScore);

  return [...qualified, ...insufficient];
}

export async function getLeaderDetail(deckId: string) {
  const leaderStandings = await db
    .select({
      tournamentId: standings.tournamentId,
      player: standings.player,
      placing: standings.placing,
      wins: standings.wins,
      losses: standings.losses,
      ties: standings.ties,
      leaderName: standings.leaderName,
      leaderSet: standings.leaderSet,
      leaderNumber: standings.leaderNumber,
      deckName: standings.deckName,
      tournamentName: tournaments.name,
      tournamentDate: tournaments.date,
      playerCount: tournaments.playerCount,
    })
    .from(standings)
    .innerJoin(tournaments, eq(standings.tournamentId, tournaments.id))
    .where(eq(standings.deckId, deckId))
    .orderBy(desc(tournaments.date));

  return leaderStandings;
}

export async function getLeaderTrends(deckId: string) {
  const trends = await db
    .select({
      tournamentId: standings.tournamentId,
      date: tournaments.date,
      entries: sql<number>`count(*)`,
      totalInTournament: tournaments.playerCount,
      wins: sql<number>`sum(${standings.wins})`,
      losses: sql<number>`sum(${standings.losses})`,
      ties: sql<number>`sum(${standings.ties})`,
      top4: sql<number>`sum(case when ${standings.placing} <= 4 and ${standings.dropRound} is null then 1 else 0 end)`,
    })
    .from(standings)
    .innerJoin(tournaments, eq(standings.tournamentId, tournaments.id))
    .where(eq(standings.deckId, deckId))
    .groupBy(standings.tournamentId, tournaments.date, tournaments.playerCount)
    .orderBy(tournaments.date);

  return trends.map((t) => {
    const wins = Number(t.wins) || 0;
    const losses = Number(t.losses) || 0;
    const ties = Number(t.ties) || 0;
    const entries = Number(t.entries) || 0;
    const totalGames = wins + losses + ties;
    return {
      date: t.date,
      tournamentId: t.tournamentId,
      playRate: t.totalInTournament ? entries / t.totalInTournament : 0,
      winRate: totalGames > 0 ? wins / totalGames : 0,
      entries,
      top4: Number(t.top4) || 0,
    };
  });
}

export async function getMatchupData(deckId: string) {
  // Single query: join pairings with both players' standings to get matchup data
  const rows = await db.execute(sql`
    SELECT
      opp.deck_id AS opp_deck_id,
      SUM(CASE WHEN p.winner = s.player THEN 1 ELSE 0 END) AS wins,
      SUM(CASE WHEN p.winner IS NOT NULL AND p.winner != s.player THEN 1 ELSE 0 END) AS losses,
      SUM(CASE WHEN p.winner IS NULL THEN 1 ELSE 0 END) AS ties
    FROM standings s
    JOIN pairings p
      ON p.tournament_id = s.tournament_id
      AND (p.player1 = s.player OR p.player2 = s.player)
    JOIN standings opp
      ON opp.tournament_id = s.tournament_id
      AND opp.player = CASE WHEN p.player1 = s.player THEN p.player2 ELSE p.player1 END
      AND opp.deck_id IS NOT NULL
    WHERE s.deck_id = ${deckId}
    GROUP BY opp.deck_id
  `);

  return (rows as unknown as Array<{ opp_deck_id: string; wins: string; losses: string; ties: string }>)
    .map((r) => {
      const wins = Number(r.wins) || 0;
      const losses = Number(r.losses) || 0;
      const ties = Number(r.ties) || 0;
      const total = wins + losses + ties;
      return {
        opponentDeckId: r.opp_deck_id,
        wins,
        losses,
        ties,
        total,
        winRate: total > 0 ? wins / total : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export interface MatrixCell {
  wins: number;
  losses: number;
  ties: number;
  total: number;
  winRate: number;
}

export type MatchupMatrix = Record<string, Record<string, MatrixCell>>;

export async function getMatchupMatrix(deckIds: string[]): Promise<MatchupMatrix> {
  if (deckIds.length === 0) return {};

  // Build parameterized IN list
  const idFragments = deckIds.map((id) => sql`${id}`);
  const inList = sql.join(idFragments, sql`, `);

  const rows = await db.execute(sql`
    SELECT
      s.deck_id,
      opp.deck_id AS opp_deck_id,
      SUM(CASE WHEN p.winner = s.player THEN 1 ELSE 0 END) AS wins,
      SUM(CASE WHEN p.winner IS NOT NULL AND p.winner != s.player THEN 1 ELSE 0 END) AS losses,
      SUM(CASE WHEN p.winner IS NULL THEN 1 ELSE 0 END) AS ties
    FROM standings s
    JOIN pairings p
      ON p.tournament_id = s.tournament_id
      AND (p.player1 = s.player OR p.player2 = s.player)
    JOIN standings opp
      ON opp.tournament_id = s.tournament_id
      AND opp.player = CASE WHEN p.player1 = s.player THEN p.player2 ELSE p.player1 END
    WHERE s.deck_id IN (${inList})
      AND opp.deck_id IN (${inList})
    GROUP BY s.deck_id, opp.deck_id
  `);

  const matrix: MatchupMatrix = {};
  for (const r of rows as unknown as Array<{
    deck_id: string;
    opp_deck_id: string;
    wins: string;
    losses: string;
    ties: string;
  }>) {
    const wins = Number(r.wins) || 0;
    const losses = Number(r.losses) || 0;
    const ties = Number(r.ties) || 0;
    const total = wins + losses + ties;

    if (!matrix[r.deck_id]) matrix[r.deck_id] = {};
    matrix[r.deck_id][r.opp_deck_id] = {
      wins,
      losses,
      ties,
      total,
      winRate: total > 0 ? wins / total : 0,
    };
  }

  return matrix;
}

/** Lightweight query: just deckId -> leaderName mapping */
export async function getLeaderNameMap(): Promise<Record<string, string>> {
  const rows = await db
    .select({
      deckId: standings.deckId,
      leaderName: sql<string>`min(${standings.leaderName})`,
    })
    .from(standings)
    .where(sql`${standings.deckId} is not null`)
    .groupBy(standings.deckId);

  const map: Record<string, string> = {};
  for (const r of rows) {
    if (r.deckId) map[r.deckId] = r.leaderName || "Unknown";
  }
  return map;
}

export async function getMetaShareData(tournamentIds?: string[]) {
  const tFilter = tournamentIds && tournamentIds.length > 0
    ? inArray(standings.tournamentId, tournamentIds)
    : undefined;

  const shares = await db
    .select({
      deckId: standings.deckId,
      leaderName: sql<string>`min(${standings.leaderName})`,
      leaderSet: sql<string | null>`min(${standings.leaderSet})`,
      leaderNumber: sql<string | null>`min(${standings.leaderNumber})`,
      count: sql<number>`count(*)`,
    })
    .from(standings)
    .where(and(sql`${standings.deckId} is not null`, tFilter))
    .groupBy(standings.deckId)
    .orderBy(sql`count(*) desc`);

  const total = shares.reduce((sum, s) => sum + Number(s.count), 0);

  return shares.map((s) => {
    const count = Number(s.count);
    return {
      deckId: s.deckId!,
      leaderName: s.leaderName || "Unknown",
      leaderSet: s.leaderSet ?? null,
      leaderNumber: s.leaderNumber ?? null,
      count,
      share: total > 0 ? count / total : 0,
    };
  });
}
