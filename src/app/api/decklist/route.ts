export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getDecklistForPlayer } from "@/lib/queries/cards";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tournamentId = searchParams.get("tournamentId");
  const player = searchParams.get("player");

  if (!tournamentId || !player) {
    return NextResponse.json(
      { error: "Missing tournamentId or player parameter" },
      { status: 400 }
    );
  }

  try {
    const cards = await getDecklistForPlayer(tournamentId, player);
    return NextResponse.json({ cards });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
