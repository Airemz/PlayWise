import { NextResponse } from "next/server";
import { searchGames } from "@/lib/rawg";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const data = await searchGames({
      search: searchParams.get("q") ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      page_size: Number(searchParams.get("page_size") ?? 20),
      genres: searchParams.get("genres") ?? undefined,
      platforms: searchParams.get("platforms") ?? undefined,
      ordering: searchParams.get("ordering") ?? undefined,
    });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
