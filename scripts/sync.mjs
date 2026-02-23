/**
 * Standalone sync script — fetches ChinoizeCup tournaments from the Limitless API
 * and writes standings, decklists, and pairings to the database.
 *
 * Usage:
 *   npm run sync            # sync unsynced tournaments (batch of 5)
 *   npm run sync -- --all   # sync all tournaments
 *   npm run sync -- --limit 10   # sync up to 10 tournaments
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, count } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  serial,
  primaryKey,
} from "drizzle-orm/pg-core";

// ── Schema (mirrored from src/lib/db/schema.ts) ────────────────────

const tournaments = pgTable("tournaments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  playerCount: integer("player_count").notNull(),
  platform: text("platform").notNull(),
  format: text("format").notNull(),
  roundCount: integer("round_count").notNull(),
  syncedAt: text("synced_at").notNull(),
});

const standings = pgTable(
  "standings",
  {
    tournamentId: text("tournament_id").notNull(),
    player: text("player").notNull(),
    displayName: text("display_name").notNull(),
    country: text("country").notNull(),
    placing: integer("placing"),
    wins: integer("wins").notNull(),
    losses: integer("losses").notNull(),
    ties: integer("ties").notNull(),
    dropRound: integer("drop_round"),
    deckId: text("deck_id"),
    deckName: text("deck_name"),
    leaderName: text("leader_name"),
    leaderSet: text("leader_set"),
    leaderNumber: text("leader_number"),
  },
  (t) => [primaryKey({ columns: [t.tournamentId, t.player], name: "standings_pk" })]
);

const decklistCards = pgTable(
  "decklist_cards",
  {
    tournamentId: text("tournament_id").notNull(),
    standingPlayer: text("standing_player").notNull(),
    cardType: text("card_type").notNull(),
    cardName: text("card_name").notNull(),
    cardSet: text("card_set").notNull(),
    cardNumber: text("card_number").notNull(),
    count: integer("count").notNull(),
    cardId: text("card_id"),
  },
  (t) => [
    primaryKey({
      columns: [t.tournamentId, t.standingPlayer, t.cardName, t.cardSet],
      name: "decklist_cards_pk",
    }),
  ]
);

const pairings = pgTable(
  "pairings",
  {
    tournamentId: text("tournament_id").notNull(),
    round: integer("round").notNull(),
    phase: text("phase").notNull(),
    table: integer("tbl").notNull(),
    player1: text("player1").notNull(),
    player2: text("player2").notNull(),
    winner: text("winner"),
  },
  (t) => [
    primaryKey({
      columns: [t.tournamentId, t.round, t.table],
      name: "pairings_pk",
    }),
  ]
);

const syncLog = pgTable("sync_log", {
  id: serial("id").primaryKey(),
  tournamentId: text("tournament_id").notNull(),
  syncType: text("sync_type").notNull(),
  status: text("status").notNull(),
  message: text("message"),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
});

// ── Helpers ─────────────────────────────────────────────────────────

const LIMITLESS_HOST = "play.limitlesstcg.com";
const API_BASE = process.env.LIMITLESS_API_BASE_URL || `https://${LIMITLESS_HOST}/api`;
const BATCH_SIZE = 100;
const API_DELAY = 4000; // ms between Limitless API calls

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(path, params) {
  const base = API_BASE.endsWith("/") ? API_BASE : API_BASE + "/";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(cleanPath, base);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Limitless API ${res.status} ${res.statusText} for ${path}`);
  }
  return res.json();
}

async function batchInsert(db, table, rows) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await db.insert(table).values(batch).onConflictDoNothing();
  }
}

function flattenDecklist(s) {
  const cards = [];
  if (!s.decklist) return cards;
  for (const card of s.decklist.character ?? []) cards.push({ ...card, type: "character" });
  for (const card of s.decklist.event ?? []) cards.push({ ...card, type: "event" });
  for (const card of s.decklist.stage ?? []) cards.push({ ...card, type: "stage" });
  return cards;
}

// ── Core sync logic ─────────────────────────────────────────────────

async function syncTournamentList(db) {
  console.log("Fetching tournament list from Limitless API...");
  const allTournaments = await fetchJson("/tournaments", { game: "OP", limit: "200" });
  const chinoize = allTournaments.filter((t) => t.name.toLowerCase().includes("chinoize"));
  console.log(`  Found ${chinoize.length} ChinoizeCup tournaments`);

  // Batch upsert all tournaments
  const rows = chinoize.map((t) => ({
    id: t.id,
    name: t.name,
    date: t.date,
    playerCount: t.players,
    platform: "online",
    format: t.format || "OP",
    roundCount: 0,
    syncedAt: new Date().toISOString(),
  }));
  await batchInsert(db, tournaments, rows);
  console.log(`  Tournament list synced`);
  return chinoize.length;
}

async function syncSingleTournament(db, tournamentId) {
  const [standingsData, pairingsData] = await Promise.all([
    fetchJson(`/tournaments/${tournamentId}/standings`),
    fetchJson(`/tournaments/${tournamentId}/pairings`),
  ]);

  // Update tournament with round count
  const maxRound = pairingsData.reduce((max, p) => Math.max(max, p.round), 0);
  await db
    .update(tournaments)
    .set({
      roundCount: maxRound,
      playerCount: standingsData.length,
      syncedAt: new Date().toISOString(),
    })
    .where(eq(tournaments.id, tournamentId));

  // Clear old data
  await db.delete(decklistCards).where(eq(decklistCards.tournamentId, tournamentId));
  await db.delete(standings).where(eq(standings.tournamentId, tournamentId));
  await db.delete(pairings).where(eq(pairings.tournamentId, tournamentId));

  // Sort non-dropped players first (by wins desc, losses asc), then dropped players
  const sortedStandings = [...standingsData].sort((a, b) => {
    const aDropped = a.drop != null;
    const bDropped = b.drop != null;
    if (aDropped !== bDropped) return aDropped ? 1 : -1;
    const aWins = a.record?.wins ?? 0;
    const bWins = b.record?.wins ?? 0;
    if (bWins !== aWins) return bWins - aWins;
    const aLosses = a.record?.losses ?? 0;
    const bLosses = b.record?.losses ?? 0;
    return aLosses - bLosses;
  });

  // Insert standings
  const standingRows = sortedStandings.map((s, i) => ({
    tournamentId,
    player: s.player || s.name?.toLowerCase() || `unknown-${i}`,
    displayName: s.name || s.player || "",
    country: s.country || "",
    placing: s.placing ?? i + 1,
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
  if (standingRows.length > 0) await batchInsert(db, standings, standingRows);

  // Insert decklist cards
  const cardRows = [];
  for (const s of standingsData) {
    const playerKey = s.player || s.name?.toLowerCase() || "unknown";
    for (const card of flattenDecklist(s)) {
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
  if (cardRows.length > 0) await batchInsert(db, decklistCards, cardRows);

  // Insert pairings (handle bye rounds with empty strings)
  // Assign sequential table numbers per round when the API doesn't provide them
  const tableCounters = {};
  const pairingRows = pairingsData.map((p) => {
    let tbl = p.table;
    if (tbl == null || tbl === 0) {
      const key = `${p.round}-${p.phase || 1}`;
      tableCounters[key] = (tableCounters[key] || 0) + 1;
      tbl = tableCounters[key];
    }
    return {
      tournamentId,
      round: p.round,
      phase: String(p.phase || 1),
      table: tbl,
      player1: p.player1 || "",
      player2: p.player2 || "",
      winner: p.winner || "",
    };
  });
  if (pairingRows.length > 0) await batchInsert(db, pairings, pairingRows);

  return { players: standingRows.length, cards: cardRows.length, pairings: pairingRows.length };
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const syncAll = args.includes("--all");
  const limitIdx = args.indexOf("--limit");
  const batchLimit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 5;

  if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL not set. Make sure .env.local exists.");
    process.exit(1);
  }

  const sql = postgres(process.env.DATABASE_URL, {
    prepare: false,
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
  });
  const db = drizzle(sql);

  try {
    // Step 1: Discover tournaments
    await syncTournamentList(db);
    await delay(API_DELAY);

    // Step 2: Find which need detail syncing
    const allTourneys = await db.select().from(tournaments);
    const standingCounts = await db
      .select({ tournamentId: standings.tournamentId, cnt: count() })
      .from(standings)
      .groupBy(standings.tournamentId);

    const syncedIds = new Set(standingCounts.map((s) => s.tournamentId));
    const unsynced = allTourneys.filter((t) => !syncedIds.has(t.id));
    const alreadySynced = allTourneys
      .filter((t) => syncedIds.has(t.id))
      .sort((a, b) => a.syncedAt.localeCompare(b.syncedAt));

    const prioritized = [...unsynced, ...alreadySynced];
    const toSync = syncAll ? prioritized : prioritized.slice(0, batchLimit);

    console.log(`\nTotal tournaments: ${allTourneys.length}`);
    console.log(`Unsynced (no standings): ${unsynced.length}`);
    console.log(`Will sync: ${toSync.length} tournaments${syncAll ? " (all)" : ""}\n`);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < toSync.length; i++) {
      const t = toSync[i];
      const label = `[${i + 1}/${toSync.length}]`;
      try {
        const result = await syncSingleTournament(db, t.id);
        console.log(
          `  ${label} ✓ ${t.name} — ${result.players} players, ${result.cards} cards, ${result.pairings} pairings`
        );
        success++;
      } catch (err) {
        console.error(`  ${label} ✗ ${t.name} — ${err.message}`);
        failed++;
      }
      if (i < toSync.length - 1) await delay(API_DELAY);
    }

    console.log(`\nDone! ${success} synced, ${failed} failed.`);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
