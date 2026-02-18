export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { syncAllTournaments, syncSingleTournament } from "@/lib/sync/sync-service";
import { db } from "@/lib/db";
import { tournaments, standings } from "@/lib/db/schema";
import { count } from "drizzle-orm";
import { delay } from "@/lib/limitless";

export async function POST(req: NextRequest) {
  // Verify secret
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const syncAll = url.searchParams.get("all") === "true";
  const limitParam = url.searchParams.get("limit");
  const batchLimit = Math.min(50, Math.max(1, limitParam ? parseInt(limitParam, 10) || 5 : 5));

  try {
    // Step 1: Sync tournament list
    const { synced, errors } = await syncAllTournaments();

    // Step 2: Find tournaments that haven't been fully synced (no standings)
    const allTournaments = await db.query.tournaments.findMany();
    const standingCounts = await db
      .select({ tournamentId: standings.tournamentId, count: count() })
      .from(standings)
      .groupBy(standings.tournamentId);

    const syncedTournamentIds = new Set(
      standingCounts.map((s) => s.tournamentId)
    );

    // Prioritize unsynced tournaments, then fall back to oldest-synced
    const unsynced = allTournaments.filter(
      (t) => !syncedTournamentIds.has(t.id)
    );
    const alreadySynced = allTournaments
      .filter((t) => syncedTournamentIds.has(t.id))
      .sort((a, b) => a.syncedAt.localeCompare(b.syncedAt));

    const prioritized = [...unsynced, ...alreadySynced];
    const toSync = syncAll ? prioritized : prioritized.slice(0, batchLimit);

    const results: Array<{ id: string; success: boolean; message: string }> = [];

    for (let i = 0; i < toSync.length; i++) {
      const t = toSync[i];
      console.log(`[sync] (${i + 1}/${toSync.length}) Syncing ${t.name || t.id}...`);
      const result = await syncSingleTournament(t.id);
      results.push({ id: t.id, ...result });
      if (result.success) {
        console.log(`[sync] (${i + 1}/${toSync.length}) ✓ ${t.name || t.id}`);
      } else {
        console.log(`[sync] (${i + 1}/${toSync.length}) ✗ ${t.name || t.id}: ${result.message}`);
      }
      if (i < toSync.length - 1) await delay(4000);
    }

    return NextResponse.json({
      tournamentsDiscovered: synced,
      totalTournaments: allTournaments.length,
      unsyncedBefore: unsynced.length,
      tournamentsSynced: results,
      errors,
    });
  } catch (err) {
    console.error("[sync] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
