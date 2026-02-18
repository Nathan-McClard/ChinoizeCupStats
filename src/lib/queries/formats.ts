import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

/**
 * Sets to exclude from format detection and the format selector.
 * EB04 is a split release — half its cards dropped during OP14, causing
 * it to appear in OP14-era tournaments and skewing format boundaries.
 */
const IGNORED_SETS = ["EB04"];

export interface FormatInfo {
  setCode: string;
  displayName: string;
  firstSeen: string;
  tournamentIds: string[];
}

/**
 * Detect the current format by finding the OP/EB set that first appeared
 * most recently in tournament decklists. Then return all tournament IDs
 * where that set appears in any decklist.
 */
export async function getCurrentFormat(): Promise<FormatInfo | null> {
  const ignored = IGNORED_SETS.map((s) => sql`${s}`);
  const ignoredList = sql.join(ignored, sql`, `);

  // Find the set with the most recent first appearance in tournament decklists
  const setRows = (await db.execute(sql`
    SELECT dc.card_set, MIN(t.date) as first_seen
    FROM decklist_cards dc
    JOIN tournaments t ON dc.tournament_id = t.id
    WHERE (dc.card_set LIKE 'OP%' OR dc.card_set LIKE 'EB%')
      AND dc.card_set ~ '^(OP|EB)[0-9]+$'
      AND dc.card_set NOT IN (${ignoredList})
    GROUP BY dc.card_set
    ORDER BY first_seen DESC
    LIMIT 1
  `)) as unknown as Array<{ card_set: string; first_seen: string }>;

  if (setRows.length === 0) return null;

  const setCode = setRows[0].card_set;
  const firstSeen = setRows[0].first_seen;

  // Get all tournament IDs where this set appears in any decklist
  const tournamentRows = (await db.execute(sql`
    SELECT DISTINCT tournament_id
    FROM decklist_cards
    WHERE card_set = ${setCode}
  `)) as unknown as Array<{ tournament_id: string }>;

  const tournamentIds = tournamentRows.map((r) => r.tournament_id);

  return {
    setCode,
    displayName: formatSetCode(setCode),
    firstSeen,
    tournamentIds,
  };
}

/**
 * Get all detected formats ordered by most recent first.
 * Each format includes the tournament IDs where that set appears.
 */
export async function getAllFormats(): Promise<FormatInfo[]> {
  const ignored = IGNORED_SETS.map((s) => sql`${s}`);
  const ignoredList = sql.join(ignored, sql`, `);

  const rows = (await db.execute(sql`
    SELECT
      dc.card_set,
      MIN(t.date) as first_seen,
      array_agg(DISTINCT dc.tournament_id) as tournament_ids
    FROM decklist_cards dc
    JOIN tournaments t ON dc.tournament_id = t.id
    WHERE (dc.card_set LIKE 'OP%' OR dc.card_set LIKE 'EB%')
      AND dc.card_set ~ '^(OP|EB)[0-9]+$'
      AND dc.card_set NOT IN (${ignoredList})
    GROUP BY dc.card_set
    ORDER BY first_seen DESC
  `)) as unknown as Array<{
    card_set: string;
    first_seen: string;
    tournament_ids: string[];
  }>;

  return rows.map((row) => ({
    setCode: row.card_set,
    displayName: formatSetCode(row.card_set),
    firstSeen: row.first_seen,
    tournamentIds: row.tournament_ids || [],
  }));
}

/**
 * Get format info for a specific set code.
 * Returns the tournament IDs where that set appears in any decklist.
 */
export async function getFormatBySetCode(
  setCode: string
): Promise<FormatInfo | null> {
  const tournamentRows = (await db.execute(sql`
    SELECT DISTINCT dc.tournament_id, MIN(t.date) as first_seen
    FROM decklist_cards dc
    JOIN tournaments t ON dc.tournament_id = t.id
    WHERE dc.card_set = ${setCode}
    GROUP BY dc.tournament_id
  `)) as unknown as Array<{ tournament_id: string; first_seen: string }>;

  if (tournamentRows.length === 0) return null;

  return {
    setCode,
    displayName: formatSetCode(setCode),
    firstSeen: tournamentRows[0].first_seen,
    tournamentIds: tournamentRows.map((r) => r.tournament_id),
  };
}

/** Format set code for display: "OP14" → "OP-14", "EB03" → "EB-03" */
export function formatSetCode(code: string): string {
  return code.replace(/^(OP|EB|ST)(\d+)$/, "$1-$2");
}
