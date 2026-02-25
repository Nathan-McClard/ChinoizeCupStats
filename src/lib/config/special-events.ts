/**
 * Special event tournament names that should be excluded from statistical
 * calculations (tier list, leader stats, player rankings, etc.) but still
 * appear on the tournaments page with a "Special Event" tag.
 *
 * Add tournament names here (case-insensitive substring match).
 */
export const SPECIAL_EVENT_NAMES = ["Heroine Battles"];

/** Check if a tournament name matches a special event */
export function isSpecialEvent(name: string): boolean {
  const lower = name.toLowerCase();
  return SPECIAL_EVENT_NAMES.some((s) => lower.includes(s.toLowerCase()));
}
