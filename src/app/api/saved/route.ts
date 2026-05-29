import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, Collections } from "@/lib/mongodb";
import { getOrCreateUserId } from "@/lib/userId";

const SaveSchema = z.object({
  gameId: z.number(),
  slug: z.string(),
  name: z.string(),
  background_image: z.string().nullable().optional(),
  released: z.string().nullable().optional(),
  rating: z.number().optional(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
  platforms: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
});

export async function GET() {
  try {
    const userId = await getOrCreateUserId();
    const db = await getDb();
    const items = await db
      .collection(Collections.savedGames)
      .find({ userId })
      .sort({ savedAt: -1 })
      .toArray();
    return NextResponse.json({ items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load saved games";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getOrCreateUserId();
    const body = SaveSchema.parse(await req.json());
    const db = await getDb();
    const now = new Date();
    await db.collection(Collections.savedGames).updateOne(
      { userId, gameId: body.gameId },
      {
        $set: {
          userId,
          gameId: body.gameId,
          slug: body.slug,
          name: body.name,
          background_image: body.background_image ?? null,
          released: body.released ?? null,
          rating: body.rating ?? 0,
          genres: body.genres ?? [],
          platforms: body.platforms ?? [],
          savedAt: now,
        },
      },
      { upsert: true }
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save game";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
