export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getMatchupData, getLeaderNameMap } from "@/lib/queries/leaders";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const { deckId } = await params;

  if (!deckId) {
    return NextResponse.json({ error: "Missing deckId" }, { status: 400 });
  }

  try {
    const [matchups, nameMap] = await Promise.all([
      getMatchupData(deckId),
      getLeaderNameMap(),
    ]);

    const data = matchups
      .filter((m) => m.opponentDeckId !== deckId)
      .map((m) => ({
        ...m,
        opponentName: nameMap[m.opponentDeckId] ?? "Unknown",
      }));

    return NextResponse.json({ matchups: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
