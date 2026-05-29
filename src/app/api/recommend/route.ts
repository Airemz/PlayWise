import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, Collections } from "@/lib/mongodb";
import { getOrCreateUserId } from "@/lib/userId";
import { searchGames } from "@/lib/rawg";
import { findCheapestDealForTitle } from "@/lib/cheapshark";
import { generateRecommendations, type RecommendationContext } from "@/lib/gemini";
import type { GameSummary, SavedGame, PriceSummary } from "@/types";

const PreferencesSchema = z.object({
  genres: z.array(z.string()).default([]),
  platforms: z.array(z.string()).default([]),
  playstyle: z.string().default(""),
  difficulty: z.string().default(""),
  maxBudget: z.number().min(0).default(0),
});

const GENRE_SLUG_MAP: Record<string, string> = {
  action: "action",
  adventure: "adventure",
  rpg: "role-playing-games-rpg",
  "role-playing": "role-playing-games-rpg",
  shooter: "shooter",
  strategy: "strategy",
  puzzle: "puzzle",
  indie: "indie",
  racing: "racing",
  sports: "sports",
  simulation: "simulation",
  platformer: "platformer",
  fighting: "fighting",
  arcade: "arcade",
  casual: "casual",
};

const PLATFORM_SLUG_MAP: Record<string, string> = {
  pc: "4",
  playstation: "187,18,16,15,27",
  ps5: "187",
  ps4: "18",
  xbox: "1,186,14,80,80",
  "xbox-series": "186",
  "xbox-one": "1",
  switch: "7",
  nintendo: "7,8,9",
  mac: "5",
  linux: "6",
};

function genresParam(prefs: string[]): string | undefined {
  const slugs = prefs
    .map((g) => GENRE_SLUG_MAP[g.toLowerCase()] ?? g.toLowerCase())
    .filter(Boolean);
  return slugs.length ? slugs.join(",") : undefined;
}

function platformsParam(prefs: string[]): string | undefined {
  const slugs = prefs
    .map((p) => PLATFORM_SLUG_MAP[p.toLowerCase()])
    .filter(Boolean);
  return slugs.length ? slugs.join(",") : undefined;
}

export async function POST(req: Request) {
  try {
    const userId = await getOrCreateUserId();
    const prefs = PreferencesSchema.parse(await req.json());

    const db = await getDb();
    const saved = (await db
      .collection(Collections.savedGames)
      .find({ userId })
      .sort({ savedAt: -1 })
      .limit(20)
      .toArray()) as unknown as SavedGame[];

    // Persist latest preferences
    await db
      .collection(Collections.preferences)
      .updateOne({ userId }, { $set: { userId, prefs, updatedAt: new Date() } }, { upsert: true });

    // Build candidate pool from RAWG
    const pool = await searchGames({
      genres: genresParam(prefs.genres),
      platforms: platformsParam(prefs.platforms),
      page_size: 12,
      ordering: "-rating",
    }).catch(() => null);

    const savedIds = new Set(saved.map((s) => s.gameId));
    const candidates: GameSummary[] = (pool?.results ?? []).filter((g) => !savedIds.has(g.id));

    const prices: Record<string, PriceSummary> = {};
    await Promise.all(
      candidates.slice(0, 10).map(async (c) => {
        prices[c.name] = await findCheapestDealForTitle(c.name);
      })
    );

    const context: RecommendationContext = {
      preferences: prefs,
      savedGames: saved,
      candidatePool: candidates.slice(0, 10).map((c) => ({
        name: c.name,
        rawgId: c.id,
        rawgSlug: c.slug,
        genres: c.genres?.map((g) => g.name),
        rating: c.rating,
        released: c.released,
        background_image: c.background_image,
        price: prices[c.name],
      })),
    };

    const recommendations = await generateRecommendations(context);

    const run = {
      userId,
      createdAt: new Date(),
      preferences: prefs,
      savedGameNames: saved.map((s) => s.name),
      recommendations,
    };
    const { insertedId } = await db.collection(Collections.recommendations).insertOne(run);

    return NextResponse.json({ id: insertedId.toString(), ...run });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Recommendation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
