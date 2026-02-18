import { db } from "@/lib/db";
import { tournaments, standings, decklistCards, pairings, syncLog } from "@/lib/db/schema";
import {
  getChinoizeTournaments,
  getTournamentStandings,
  getTournamentPairings,
  delay,
} from "@/lib/limitless";
import type { Standing, DeckCard } from "@/lib/limitless";
import { eq } from "drizzle-orm";

const BATCH_SIZE = 100;

async function batchInsert<T extends Record<string, unknown>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  rows: T[]
): Promise<void> {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.insert(table).values(batch as any).onConflictDoNothing();
  }
}

/** Flatten decklist sections (character, event, stage) into a flat card array with type labels */
function flattenDecklist(s: Standing): Array<DeckCard & { type: string }> {
  const cards: Array<DeckCard & { type: string }> = [];
  if (!s.decklist) return cards;

  for (const card of s.decklist.character ?? []) {
    cards.push({ ...card, type: "character" });
  }
  for (const card of s.decklist.event ?? []) {
    cards.push({ ...card, type: "event" });
  }
  for (const card of s.decklist.stage ?? []) {
    cards.push({ ...card, type: "stage" });
  }
  return cards;
}

export async function syncAllTournaments(): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;

  try {
    const apiTournaments = await getChinoizeTournaments();

    for (const t of apiTournaments) {
      try {
        // Upsert tournament
        await db
          .insert(tournaments)
          .values({
            id: t.id,
            name: t.name,
            date: t.date,
            playerCount: t.players,
            platform: "online",
            format: t.format || "OP",
            roundCount: 0,
            syncedAt: new Date().toISOString(),
          })
          .onConflictDoNothing();

        synced++;
        await delay(100);
      } catch (err) {
        const msg = `Failed to sync tournament ${t.id}: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(msg);
      }
    }
  } catch (err) {
    errors.push(`Failed to fetch tournaments: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { synced, errors };
}

export async function syncSingleTournament(tournamentId: string): Promise<{ success: boolean; message: string }> {
  const logEntry = {
    tournamentId,
    syncType: "full",
    status: "running",
    startedAt: new Date().toISOString(),
  };

  const [log] = await db.insert(syncLog).values(logEntry).returning();

  try {
    // Fetch standings and pairings in parallel (no details endpoint exists)
    const [standingsData, pairingsData] = await Promise.all([
      getTournamentStandings(tournamentId),
      getTournamentPairings(tournamentId),
    ]);

    // Update tournament with round count derived from pairings
    const maxRound = pairingsData.reduce((max, p) => Math.max(max, p.round), 0);
    await db
      .update(tournaments)
      .set({
        roundCount: maxRound,
        playerCount: standingsData.length,
        syncedAt: new Date().toISOString(),
      })
      .where(eq(tournaments.id, tournamentId));

    // Delete existing data for re-sync
    await db.delete(decklistCards).where(eq(decklistCards.tournamentId, tournamentId));
    await db.delete(standings).where(eq(standings.tournamentId, tournamentId));
    await db.delete(pairings).where(eq(pairings.tournamentId, tournamentId));

    // Build standing rows - compute placing when API returns null.
    // Sort non-dropped players first (by wins desc, losses asc), then dropped players.
    const sortedStandings = [...standingsData].sort((a, b) => {
      const aDropped = a.drop != null;
      const bDropped = b.drop != null;
      // Non-dropped players come first
      if (aDropped !== bDropped) return aDropped ? 1 : -1;
      // Within each group, sort by wins desc then losses asc
      const aWins = a.record?.wins ?? 0;
      const bWins = b.record?.wins ?? 0;
      if (bWins !== aWins) return bWins - aWins;
      const aLosses = a.record?.losses ?? 0;
      const bLosses = b.record?.losses ?? 0;
      return aLosses - bLosses;
    });

    const standingRows = sortedStandings.map((s, index) => ({
      tournamentId,
      player: s.player || s.name?.toLowerCase() || `unknown-${index}`,
      displayName: s.name || s.player || "",
      country: s.country || "",
      placing: s.placing ?? (index + 1),
      wins: s.record?.wins ?? 0,
      losses: s.record?.losses ?? 0,
      ties: s.record?.ties ?? 0,
      dropRound: s.drop ?? null,
      deckId: s.deck?.id ?? null,
      deckName: s.deck?.name ?? null,
      leaderName: s.decklist?.leader?.name ?? null,
      leaderSet: s.decklist?.leader?.set ?? null,
      leaderNumber: s.decklist?.leader?.number ?? null,
    }));

    if (standingRows.length > 0) {
      await batchInsert(standings, standingRows);
    }

    // Build decklist card rows from the structured decklist sections
    const cardRows: Array<Record<string, unknown>> = [];
    for (const s of standingsData) {
      const playerKey = s.player || s.name?.toLowerCase() || "unknown";
      const cards = flattenDecklist(s);
      for (const card of cards) {
        cardRows.push({
          tournamentId,
          standingPlayer: playerKey,
          cardType: card.type,
          cardName: card.name,
          cardSet: card.set,
          cardNumber: card.number,
          count: card.count,
          cardId: `${card.set}-${card.number}`,
        });
      }
    }

    if (cardRows.length > 0) {
      await batchInsert(decklistCards, cardRows);
    }

    // Build pairing rows - convert phase number to string, handle bye rounds
    const pairingRows = pairingsData.map((p) => ({
      tournamentId,
      round: p.round,
      phase: String(p.phase || 1),
      table: p.table,
      player1: p.player1 || "",
      player2: p.player2 || "",
      winner: p.winner || "",
    }));

    if (pairingRows.length > 0) {
      await batchInsert(pairings, pairingRows);
    }

    // Update sync log
    await db
      .update(syncLog)
      .set({
        status: "success",
        message: `Synced ${standingRows.length} standings, ${cardRows.length} cards, ${pairingRows.length} pairings`,
        completedAt: new Date().toISOString(),
      })
      .where(eq(syncLog.id, log.id));

    return {
      success: true,
      message: `Successfully synced tournament ${tournamentId}: ${standingRows.length} players, ${cardRows.length} cards, ${pairingRows.length} pairings`,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    await db
      .update(syncLog)
      .set({
        status: "error",
        message: errorMsg.slice(0, 1000),
        completedAt: new Date().toISOString(),
      })
      .where(eq(syncLog.id, log.id));

    return { success: false, message: errorMsg };
  }
}
