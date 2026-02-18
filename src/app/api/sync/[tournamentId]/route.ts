export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { syncSingleTournament } from "@/lib/sync/sync-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tournamentId: string }> }
) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tournamentId } = await params;

  try {
    const result = await syncSingleTournament(tournamentId);

    return NextResponse.json(
      { success: result.success, message: result.success ? "Synced" : "Sync failed" },
      { status: result.success ? 200 : 500 },
    );
  } catch (err) {
    console.error(`[sync] Error syncing ${tournamentId}:`, err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
