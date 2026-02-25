import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { tournaments, standings } from "@/lib/db/schema";
import { sql, desc } from "drizzle-orm";
import { siteConfig } from "@/lib/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.url}/tier-list`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/tournaments`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteConfig.url}/players`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteConfig.url}/decklists`, changeFrequency: "daily", priority: 0.7 },
    { url: `${siteConfig.url}/cards`, changeFrequency: "daily", priority: 0.7 },
    { url: `${siteConfig.url}/trends`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteConfig.url}/about`, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Tournament detail pages
  const allTournaments = await db
    .select({ id: tournaments.id, date: tournaments.date })
    .from(tournaments)
    .orderBy(desc(tournaments.date));

  const tournamentRoutes: MetadataRoute.Sitemap = allTournaments.map((t) => ({
    url: `${siteConfig.url}/tournaments/${t.id}`,
    lastModified: t.date,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Leader detail pages (5+ entries = qualified)
  const leaderRows = (await db.execute(sql`
    SELECT deck_id, count(*) as entries
    FROM standings
    WHERE deck_id IS NOT NULL
    GROUP BY deck_id
    HAVING count(*) >= 5
  `)) as unknown as Array<{ deck_id: string; entries: string }>;

  const leaderRoutes: MetadataRoute.Sitemap = leaderRows.map((r) => ({
    url: `${siteConfig.url}/leaders/${encodeURIComponent(r.deck_id)}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  // Player detail pages (3+ tournaments)
  const playerRows = (await db.execute(sql`
    SELECT player, count(DISTINCT tournament_id) as tourney_count
    FROM standings
    GROUP BY player
    HAVING count(DISTINCT tournament_id) >= 3
  `)) as unknown as Array<{ player: string; tourney_count: string }>;

  const playerRoutes: MetadataRoute.Sitemap = playerRows.map((r) => ({
    url: `${siteConfig.url}/players/${encodeURIComponent(r.player)}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...tournamentRoutes, ...leaderRoutes, ...playerRoutes];
}
