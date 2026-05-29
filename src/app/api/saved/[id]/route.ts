import { NextResponse } from "next/server";
import { getDb, Collections } from "@/lib/mongodb";
import { getOrCreateUserId } from "@/lib/userId";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const gameId = Number(id);
    if (!Number.isFinite(gameId)) {
      return NextResponse.json({ error: "Invalid game id" }, { status: 400 });
    }
    const userId = await getOrCreateUserId();
    const db = await getDb();
    await db.collection(Collections.savedGames).deleteOne({ userId, gameId });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to remove";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
