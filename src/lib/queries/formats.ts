import { cache } from "react";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { SPECIAL_EVENT_NAMES } from "@/lib/config/special-events";

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

/** SQL fragment to exclude special event tournaments by name */
function specialEventExclusion(tableAlias: string = "t") {
  if (SPECIAL_EVENT_NAMES.length === 0) return sql`true`;
  const conditions = SPECIAL_EVENT_NAMES.map(
    (name) => sql`${sql.raw(tableAlias)}.name NOT ILIKE ${"%" + name + "%"}`
  );
  return sql.join(conditions, sql` AND `);
}

/**
 * Get all standard (non-special-event) tournament IDs.
 * Used for "All Time" mode to still exclude special events from stats.
 */
export async function getStandardTournamentIds(): Promise<string[]> {
  if (SPECIAL_EVENT_NAMES.length === 0) return [];

  const rows = (await db.execute(sql`
    SELECT id FROM tournaments
    WHERE ${specialEventExclusion("tournaments")}
  `)) as unknown as Array<{ id: string }>;

  return rows.map((r) => r.id);
}

export interface ResolvedFormat {
  /** Tournament IDs to pass to query functions (undefined = no filter needed) */
  tournamentIds: string[] | undefined;
  /** The active format info, or null for "All Time" */
  activeFormat: FormatInfo | null;
  /** Value for the FormatSelector component */
  activeFormatValue: string;
  /** All formats for the FormatSelector */
  formatOptions: { setCode: string; displayName: string; tournamentCount: number }[];
  /** Current format code */
  currentFormatCode: string;
}

/**
 * Shared format resolution logic used by all pages.
 * Always excludes special event tournaments from the returned tournamentIds.
 */
export const resolveFormatFilter = cache(async (
  formatParam?: string
): Promise<ResolvedFormat> => {
  const [currentFormat, allFormats] = await Promise.all([
    getCurrentFormat(),
    getAllFormats(),
  ]);

  let activeFormat = currentFormat;
  if (formatParam === "all") {
    activeFormat = null;
  } else if (formatParam && formatParam !== currentFormat?.setCode) {
    activeFormat = await getFormatBySetCode(formatParam);
  }

  let tournamentIds: string[] | undefined;

  if (activeFormat) {
    // Format-specific: filter out special event tournaments from format IDs
    if (SPECIAL_EVENT_NAMES.length > 0) {
      const excludedIds = await getSpecialEventIds();
      const excluded = new Set(excludedIds);
      tournamentIds = activeFormat.tournamentIds.filter((id) => !excluded.has(id));
    } else {
      tournamentIds = activeFormat.tournamentIds;
    }
  } else {
    // "All Time": get all IDs except special events
    if (SPECIAL_EVENT_NAMES.length > 0) {
      tournamentIds = await getStandardTournamentIds();
    } else {
      tournamentIds = undefined;
    }
  }

  const formatOptions = allFormats.map((f) => ({
    setCode: f.setCode,
    displayName: f.displayName,
    tournamentCount: f.tournamentIds.length,
  }));

  const activeFormatValue =
    formatParam === "all"
      ? "all"
      : (activeFormat?.setCode ?? currentFormat?.setCode ?? "all");

  return {
    tournamentIds,
    activeFormat,
    activeFormatValue,
    formatOptions,
    currentFormatCode: currentFormat?.setCode ?? "",
  };
});

/** Get IDs of all special event tournaments */
async function getSpecialEventIds(): Promise<string[]> {
  if (SPECIAL_EVENT_NAMES.length === 0) return [];

  const conditions = SPECIAL_EVENT_NAMES.map(
    (name) => sql`tournaments.name ILIKE ${"%" + name + "%"}`
  );
  const whereClause = sql.join(conditions, sql` OR `);

  const rows = (await db.execute(sql`
    SELECT id FROM tournaments WHERE ${whereClause}
  `)) as unknown as Array<{ id: string }>;

  return rows.map((r) => r.id);
}
