import { NextResponse } from "next/server";
import { getGame } from "@/lib/rawg";
import { findCheapestDealForTitle } from "@/lib/cheapshark";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const game = await getGame(id);
    const price = await findCheapestDealForTitle(game.name);
    return NextResponse.json({ game, price });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load game";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
