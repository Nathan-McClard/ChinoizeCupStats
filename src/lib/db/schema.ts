import { pgTable, text, integer, serial, primaryKey, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Tournaments ──────────────────────────────────────────────────────
export const tournaments = pgTable("tournaments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  playerCount: integer("player_count").notNull(),
  platform: text("platform").notNull(),
  format: text("format").notNull(),
  roundCount: integer("round_count").notNull(),
  syncedAt: text("synced_at").notNull(),
});

export const tournamentsRelations = relations(tournaments, ({ many }) => ({
  standings: many(standings),
  pairings: many(pairings),
}));

// ── Standings ────────────────────────────────────────────────────────
export const standings = pgTable(
  "standings",
  {
    tournamentId: text("tournament_id")
      .notNull()
      .references(() => tournaments.id),
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
  (t) => [
    primaryKey({ columns: [t.tournamentId, t.player], name: "standings_pk" }),
  ]
);

export const standingsRelations = relations(standings, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [standings.tournamentId],
    references: [tournaments.id],
  }),
  decklistCards: many(decklistCards),
}));

// ── Decklist Cards ───────────────────────────────────────────────────
export const decklistCards = pgTable(
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
    index("decklist_cards_card_set_idx").on(t.cardSet),
    index("decklist_cards_tournament_id_idx").on(t.tournamentId),
  ]
);

export const decklistCardsRelations = relations(decklistCards, ({ one }) => ({
  standing: one(standings, {
    fields: [decklistCards.tournamentId, decklistCards.standingPlayer],
    references: [standings.tournamentId, standings.player],
  }),
}));

// ── Pairings ─────────────────────────────────────────────────────────
export const pairings = pgTable(
  "pairings",
  {
    tournamentId: text("tournament_id")
      .notNull()
      .references(() => tournaments.id),
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

export const pairingsRelations = relations(pairings, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [pairings.tournamentId],
    references: [tournaments.id],
  }),
}));

// ── Sync Log ─────────────────────────────────────────────────────────
export const syncLog = pgTable("sync_log", {
  id: serial("id").primaryKey(),
  tournamentId: text("tournament_id").notNull(),
  syncType: text("sync_type").notNull(),
  status: text("status").notNull(),
  message: text("message"),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
});
