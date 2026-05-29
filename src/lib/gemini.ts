import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Preferences, Recommendation, SavedGame, PriceSummary } from "@/types";

function client() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(key);
}

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

export type RecommendationContext = {
  preferences: Preferences;
  savedGames: SavedGame[];
  candidatePool: {
    name: string;
    rawgId?: number;
    rawgSlug?: string;
    genres?: string[];
    rating?: number;
    released?: string | null;
    background_image?: string | null;
    price?: PriceSummary;
  }[];
};

const SYSTEM_INSTRUCTION = `You are PlayWise, a video-game recommendation assistant.
You produce JSON only. Recommendations must be drawn from the candidate pool the user gives you when possible.
If a recommendation is not in the candidate pool, only include well-known titles relevant to the user's stated preferences. Never invent titles you are not confident exist.`;

export async function generateRecommendations(ctx: RecommendationContext): Promise<Recommendation[]> {
  const model = client().getGenerativeModel({
    model: MODEL,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.6,
    },
  });

  const prompt = buildPrompt(ctx);

  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("Gemini returned unparseable JSON");
    parsed = JSON.parse(match[0]);
  }

  const list = Array.isArray(parsed) ? parsed : (parsed as { recommendations?: unknown[] }).recommendations;
  if (!Array.isArray(list)) throw new Error("Gemini response missing recommendations array");

  return list
    .map((item) => normalize(item as Record<string, unknown>, ctx))
    .filter((r): r is Recommendation => r !== null)
    .slice(0, 8);
}

function buildPrompt(ctx: RecommendationContext): string {
  const { preferences, savedGames, candidatePool } = ctx;

  const savedSummary = savedGames.length
    ? savedGames
        .slice(0, 20)
        .map(
          (g) =>
            `- ${g.name}${g.genres?.length ? ` [${g.genres.map((x) => x.name).join(", ")}]` : ""}${
              g.rating ? ` (rating ${g.rating})` : ""
            }`
        )
        .join("\n")
    : "(none)";

  const candidatesSummary = candidatePool.length
    ? candidatePool
        .map((c) => {
          const priceBit = c.price?.available
            ? ` cheapest $${c.price.cheapest?.toFixed(2)}${c.price.storeName ? ` on ${c.price.storeName}` : ""}`
            : " (no current PC deal)";
          return `- ${c.name}${c.genres?.length ? ` [${c.genres.join(", ")}]` : ""}${
            c.rating ? ` rating ${c.rating}` : ""
          }${priceBit}`;
        })
        .join("\n")
    : "(no candidates available — recommend from general knowledge constrained to preferences)";

  return `User preferences:
- Genres: ${preferences.genres.join(", ") || "any"}
- Platforms: ${preferences.platforms.join(", ") || "any"}
- Playstyle: ${preferences.playstyle || "any"}
- Difficulty: ${preferences.difficulty || "any"}
- Max budget (USD): ${preferences.maxBudget > 0 ? `$${preferences.maxBudget.toFixed(2)}` : "no limit"}

Games the user has saved as favorites:
${savedSummary}

Candidate pool (real games with current PC pricing where available):
${candidatesSummary}

Return JSON in this exact schema:
{
  "recommendations": [
    {
      "title": string,           // exact game title
      "rawgSlug": string|null,   // slug from candidate pool if from there, else null
      "reason": string,          // 1-2 sentences why it fits this user
      "matchScore": number,      // 0-100, how well it matches preferences and saved games
      "estimatedPrice": number|null, // USD, if known from candidate pool
      "withinBudget": boolean    // true if estimatedPrice <= maxBudget OR maxBudget is 0
    }
  ]
}

Constraints:
- Return 5 to 8 recommendations.
- Prefer items from the candidate pool when they fit. Only fall outside the pool when none of the candidates match well.
- Do not recommend a game the user already has saved.
- If the user has a budget > 0, set withinBudget honestly based on the candidate pool price.
- Output JSON only. No prose, no markdown.`;
}

function normalize(item: Record<string, unknown>, ctx: RecommendationContext): Recommendation | null {
  const title = typeof item.title === "string" ? item.title.trim() : "";
  if (!title) return null;
  const reason = typeof item.reason === "string" ? item.reason : "";
  const matchScore = clampNumber(item.matchScore, 0, 100, 60);
  const slugRaw = typeof item.rawgSlug === "string" ? item.rawgSlug : "";
  const candidate = ctx.candidatePool.find(
    (c) => c.rawgSlug === slugRaw || c.name.toLowerCase() === title.toLowerCase()
  );
  const estimated =
    typeof item.estimatedPrice === "number"
      ? item.estimatedPrice
      : candidate?.price?.cheapest;
  const withinBudget =
    typeof item.withinBudget === "boolean"
      ? item.withinBudget
      : ctx.preferences.maxBudget <= 0
        ? true
        : typeof estimated === "number"
          ? estimated <= ctx.preferences.maxBudget
          : false;

  return {
    title,
    reason,
    matchScore,
    estimatedPrice: typeof estimated === "number" ? estimated : undefined,
    withinBudget,
    rawgId: candidate?.rawgId,
    rawgSlug: candidate?.rawgSlug,
    background_image: candidate?.background_image ?? null,
    dealLink: candidate?.price?.dealLink,
  };
}

function clampNumber(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
