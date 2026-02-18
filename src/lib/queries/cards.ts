import { db } from "@/lib/db";
import { decklistCards, standings } from "@/lib/db/schema";
import { eq, sql, desc, and, inArray } from "drizzle-orm";

export async function getMostPlayedCards(limit = 50, tournamentIds?: string[]) {
  const tFilter = tournamentIds && tournamentIds.length > 0
    ? inArray(decklistCards.tournamentId, tournamentIds)
    : undefined;

  const cards = await db
    .select({
      cardName: decklistCards.cardName,
      cardSet: decklistCards.cardSet,
      cardNumber: decklistCards.cardNumber,
      cardType: sql<string>`min(${decklistCards.cardType})`,
      cardId: sql<string>`min(${decklistCards.cardId})`,
      totalDecks: sql<number>`count(distinct ${decklistCards.standingPlayer} || '-' || ${decklistCards.tournamentId})`,
      avgCopies: sql<number>`avg(${decklistCards.count})`,
      totalCopies: sql<number>`sum(${decklistCards.count})`,
    })
    .from(decklistCards)
    .where(tFilter)
    .groupBy(decklistCards.cardName, decklistCards.cardSet, decklistCards.cardNumber)
    .orderBy(sql`count(distinct ${decklistCards.standingPlayer} || '-' || ${decklistCards.tournamentId}) desc`)
    .limit(limit);

  return cards;
}

export async function getCardsByLeader(deckId: string) {
  // Get all decklist cards for standings with this leader
  const cards = await db
    .select({
      cardName: decklistCards.cardName,
      cardSet: decklistCards.cardSet,
      cardNumber: decklistCards.cardNumber,
      cardType: sql<string>`min(${decklistCards.cardType})`,
      totalDecks: sql<number>`count(distinct ${decklistCards.standingPlayer} || '-' || ${decklistCards.tournamentId})`,
      avgCopies: sql<number>`avg(${decklistCards.count})`,
    })
    .from(decklistCards)
    .innerJoin(
      standings,
      and(
        eq(decklistCards.tournamentId, standings.tournamentId),
        eq(decklistCards.standingPlayer, standings.player)
      )
    )
    .where(eq(standings.deckId, deckId))
    .groupBy(decklistCards.cardName, decklistCards.cardSet, decklistCards.cardNumber)
    .orderBy(sql`count(distinct ${decklistCards.standingPlayer} || '-' || ${decklistCards.tournamentId}) desc`);

  // Calculate total decks for this leader
  const totalDecks = await db
    .select({ count: sql<number>`count(*)` })
    .from(standings)
    .where(eq(standings.deckId, deckId));

  const total = Number(totalDecks[0]?.count) || 1;

  return cards.map((c) => ({
    ...c,
    totalDecks: Number(c.totalDecks),
    avgCopies: Number(c.avgCopies),
    inclusionRate: Number(c.totalDecks) / total,
  }));
}

export async function getDecklistForPlayer(tournamentId: string, player: string) {
  return db.query.decklistCards.findMany({
    where: and(
      eq(decklistCards.tournamentId, tournamentId),
      eq(decklistCards.standingPlayer, player)
    ),
    orderBy: [decklistCards.cardType, decklistCards.cardName],
  });
}
