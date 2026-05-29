import { NextResponse } from "next/server";
import { getDb, Collections } from "@/lib/mongodb";
import { getOrCreateUserId } from "@/lib/userId";

export async function GET() {
  try {
    const userId = await getOrCreateUserId();
    const db = await getDb();
    const runs = await db
      .collection(Collections.recommendations)
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    return NextResponse.json({
      items: runs.map((r) => ({ ...r, _id: r._id.toString() })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load history";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
