import { cache } from "react";
import { db } from "@/lib/db";
import { standings, tournaments } from "@/lib/db/schema";
import { eq, and, asc, desc, sql, lte, isNotNull, ilike, inArray } from "drizzle-orm";
import { getDecklistForPlayer } from "./cards";

export interface DecklistEntry {
  tournamentId: string;
  tournamentName: string;
  tournamentDate: string;
  player: string;
  displayName: string;
  placing: number | null;
  wins: number;
  losses: number;
  ties: number;
  deckId: string | null;
  deckName: string | null;
  leaderName: string | null;
  leaderSet: string | null;
  leaderNumber: string | null;
}

export const getDecklistEntry = cache(async (
  tournamentId: string,
  player: string
): Promise<DecklistEntry | null> => {
  const results = await db
    .select({
      tournamentId: standings.tournamentId,
      tournamentName: tournaments.name,
      tournamentDate: tournaments.date,
      player: standings.player,
      displayName: standings.displayName,
      placing: standings.placing,
      wins: standings.wins,
      losses: standings.losses,
      ties: standings.ties,
      deckId: standings.deckId,
      deckName: standings.deckName,
      leaderName: standings.leaderName,
      leaderSet: standings.leaderSet,
      leaderNumber: standings.leaderNumber,
    })
    .from(standings)
    .innerJoin(tournaments, eq(standings.tournamentId, tournaments.id))
    .where(
      and(eq(standings.tournamentId, tournamentId), eq(standings.player, player))
    )
    .limit(1);

  return results[0] ?? null;
});

export async function getTopDecklists(
  deckId: string,
  limit = 50
): Promise<DecklistEntry[]> {
  const results = await db
    .select({
      tournamentId: standings.tournamentId,
      tournamentName: tournaments.name,
      tournamentDate: tournaments.date,
      player: standings.player,
      displayName: standings.displayName,
      placing: standings.placing,
      wins: standings.wins,
      losses: standings.losses,
      ties: standings.ties,
      deckId: standings.deckId,
      deckName: standings.deckName,
      leaderName: standings.leaderName,
      leaderSet: standings.leaderSet,
      leaderNumber: standings.leaderNumber,
    })
    .from(standings)
    .innerJoin(tournaments, eq(standings.tournamentId, tournaments.id))
    .where(
      and(
        eq(standings.deckId, deckId),
        isNotNull(standings.placing),
        isNotNull(standings.deckId)
      )
    )
    .orderBy(asc(standings.placing), desc(tournaments.date), desc(standings.wins))
    .limit(limit);

  return results;
}

export async function getDecklists(filters?: {
  deckId?: string;
  tournamentId?: string;
  maxPlacing?: number;
  tournamentIds?: string[];
  playerSearch?: string;
  sortBy?: "placing" | "date" | "winrate";
}): Promise<DecklistEntry[]> {
  const conditions = [];

  if (filters?.deckId) {
    conditions.push(eq(standings.deckId, filters.deckId));
  }
  if (filters?.tournamentId) {
    conditions.push(eq(standings.tournamentId, filters.tournamentId));
  }
  if (filters?.maxPlacing) {
    conditions.push(lte(standings.placing, filters.maxPlacing));
  }
  if (filters?.tournamentIds && filters.tournamentIds.length > 0) {
    conditions.push(inArray(standings.tournamentId, filters.tournamentIds));
  }
  if (filters?.playerSearch) {
    conditions.push(ilike(standings.displayName, `%${filters.playerSearch}%`));
  }
  // Only include entries that have a deck
  conditions.push(sql`${standings.deckId} is not null`);

  // Determine ordering
  let orderClauses;
  switch (filters?.sortBy) {
    case "winrate":
      orderClauses = [desc(standings.wins), asc(standings.losses), desc(tournaments.date)];
      break;
    case "date":
      orderClauses = [desc(tournaments.date), asc(standings.placing)];
      break;
    case "placing":
    default:
      orderClauses = [desc(tournaments.date), asc(standings.placing)];
      break;
  }

  const results = await db
    .select({
      tournamentId: standings.tournamentId,
      tournamentName: tournaments.name,
      tournamentDate: tournaments.date,
      player: standings.player,
      displayName: standings.displayName,
      placing: standings.placing,
      wins: standings.wins,
      losses: standings.losses,
      ties: standings.ties,
      deckId: standings.deckId,
      deckName: standings.deckName,
      leaderName: standings.leaderName,
      leaderSet: standings.leaderSet,
      leaderNumber: standings.leaderNumber,
    })
    .from(standings)
    .innerJoin(tournaments, eq(standings.tournamentId, tournaments.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(...orderClauses)
    .limit(500);

  return results;
}

// ── Grouped Decklists (Archetype Explorer) ───────────────────────────

export interface DeckCard {
  cardType: string;
  cardName: string;
  cardSet: string;
  cardNumber: string;
  count: number;
}

export interface ArchetypePilot {
  tournamentId: string;
  tournamentName: string;
  tournamentDate: string;
  player: string;
  displayName: string;
  placing: number | null;
}

export interface GroupedDecklist {
  fingerprint: string;
  totalWins: number;
  totalLosses: number;
  totalTies: number;
  pilotCount: number;
  bestPlacing: number | null;
  winRate: number;
  repTournamentId: string;
  repPlayer: string;
  pilots: ArchetypePilot[];
}

export interface GroupedDecklistWithCards extends GroupedDecklist {
  cards: DeckCard[];
}

export async function getGroupedDecklists(
  deckId: string,
  tournamentIds?: string[],
): Promise<GroupedDecklistWithCards[]> {
  const tournamentFilter =
    tournamentIds && tournamentIds.length > 0
      ? sql`AND s.tournament_id IN (${sql.join(
          tournamentIds.map((id) => sql`${id}`),
          sql`, `,
        )})`
      : sql``;

  const result = await db.execute(sql`
    SELECT
      sub.fingerprint,
      SUM(sub.wins)::int AS total_wins,
      SUM(sub.losses)::int AS total_losses,
      SUM(sub.ties)::int AS total_ties,
      COUNT(*)::int AS pilot_count,
      MIN(sub.placing) AS best_placing,
      (array_agg(sub.tournament_id ORDER BY sub.placing ASC NULLS LAST, sub.wins DESC, sub.tournament_id, sub.player))[1] AS rep_tournament_id,
      (array_agg(sub.player ORDER BY sub.placing ASC NULLS LAST, sub.wins DESC, sub.tournament_id, sub.player))[1] AS rep_player,
      CASE WHEN (SUM(sub.wins) + SUM(sub.losses) + SUM(sub.ties)) > 0
        THEN ROUND(SUM(sub.wins)::numeric / (SUM(sub.wins) + SUM(sub.losses) + SUM(sub.ties)) * 100, 1)
        ELSE 0
      END AS win_rate,
      json_agg(json_build_object(
        'tournamentId', sub.tournament_id,
        'tournamentName', sub.tournament_name,
        'tournamentDate', sub.tournament_date,
        'player', sub.player,
        'displayName', sub.display_name,
        'placing', sub.placing
      ) ORDER BY sub.tournament_date DESC, sub.placing ASC NULLS LAST) AS pilots
    FROM (
      SELECT
        s.tournament_id,
        t.name AS tournament_name,
        t.date AS tournament_date,
        s.player,
        s.display_name,
        s.wins,
        s.losses,
        s.ties,
        s.placing,
        string_agg(
          dc.card_set || '-' || dc.card_number || ':' || dc."count"::text,
          ',' ORDER BY dc.card_set, dc.card_number
        ) AS fingerprint
      FROM standings s
      INNER JOIN tournaments t ON t.id = s.tournament_id
      INNER JOIN decklist_cards dc
        ON dc.tournament_id = s.tournament_id
        AND dc.standing_player = s.player
      WHERE s.deck_id = ${deckId}
        ${tournamentFilter}
        AND dc.card_type NOT IN ('Leader', 'DON!!')
      GROUP BY s.tournament_id, t.name, t.date, s.player, s.display_name, s.wins, s.losses, s.ties, s.placing
    ) sub
    GROUP BY sub.fingerprint
    ORDER BY
      (SUM(sub.wins) + SUM(sub.losses) + SUM(sub.ties)) DESC,
      CASE WHEN (SUM(sub.wins) + SUM(sub.losses) + SUM(sub.ties)) > 0
        THEN SUM(sub.wins)::numeric / (SUM(sub.wins) + SUM(sub.losses) + SUM(sub.ties))
        ELSE 0
      END DESC
    LIMIT 50
  `);

  const rows = result as unknown as Array<{
    fingerprint: string;
    total_wins: string;
    total_losses: string;
    total_ties: string;
    pilot_count: string;
    best_placing: number | null;
    win_rate: string;
    rep_tournament_id: string;
    rep_player: string;
    pilots: ArchetypePilot[] | string;
  }>;

  const grouped: GroupedDecklist[] = rows.map((row) => ({
    fingerprint: row.fingerprint,
    totalWins: Number(row.total_wins),
    totalLosses: Number(row.total_losses),
    totalTies: Number(row.total_ties),
    pilotCount: Number(row.pilot_count),
    bestPlacing: row.best_placing,
    winRate: Number(row.win_rate),
    repTournamentId: row.rep_tournament_id,
    repPlayer: row.rep_player,
    pilots: typeof row.pilots === "string" ? JSON.parse(row.pilots) : row.pilots,
  }));

  // Fetch cards for each representative in parallel
  const withCards: GroupedDecklistWithCards[] = await Promise.all(
    grouped.map(async (g) => {
      const cards = await getDecklistForPlayer(g.repTournamentId, g.repPlayer);
      return {
        ...g,
        cards: cards.map((c) => ({
          cardType: c.cardType,
          cardName: c.cardName,
          cardSet: c.cardSet,
          cardNumber: c.cardNumber,
          count: c.count,
        })),
      };
    }),
  );

  return withCards;
}
