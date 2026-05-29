import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const RAWG_BASE = "https://api.rawg.io/api";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const CHEAPSHARK_BASE = "https://www.cheapshark.com/api/1.0";

export const dynamic = "force-dynamic";

type Check = {
  ok: boolean;
  status?: number;
  message?: string;
};

export async function GET() {
  const rawgKey = process.env.RAWG_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const mongoUri = process.env.MONGODB_URI;

  const [mongo, rawg, cheapshark, gemini] = await Promise.all([
    checkMongo(Boolean(mongoUri)),
    checkRawg(rawgKey),
    checkCheapShark(),
    checkGemini(geminiKey, geminiModel),
  ]);

  return NextResponse.json({
    env: {
      RAWG_API_KEY: Boolean(rawgKey),
      GEMINI_API_KEY: Boolean(geminiKey),
      GEMINI_MODEL: geminiModel,
      MONGODB_URI: Boolean(mongoUri),
      MONGODB_DB: process.env.MONGODB_DB || "playwise",
    },
    checks: {
      mongo,
      rawg,
      cheapshark,
      gemini,
    },
  });
}

async function checkMongo(hasUri: boolean): Promise<Check> {
  if (!hasUri) return { ok: false, message: "MONGODB_URI is missing" };
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return { ok: true };
  } catch (err) {
    return errorCheck(err);
  }
}

async function checkRawg(key: string | undefined): Promise<Check> {
  if (!key) return { ok: false, message: "RAWG_API_KEY is missing" };
  try {
    const url = new URL(`${RAWG_BASE}/games`);
    url.searchParams.set("key", key);
    url.searchParams.set("page_size", "1");
    const res = await fetch(url, { cache: "no-store" });
    return { ok: res.ok, status: res.status, message: res.ok ? undefined : await safeText(res) };
  } catch (err) {
    return errorCheck(err);
  }
}

async function checkCheapShark(): Promise<Check> {
  try {
    const res = await fetch(`${CHEAPSHARK_BASE}/stores`, { cache: "no-store" });
    return { ok: res.ok, status: res.status, message: res.ok ? undefined : await safeText(res) };
  } catch (err) {
    return errorCheck(err);
  }
}

async function checkGemini(key: string | undefined, model: string): Promise<Check> {
  if (!key) return { ok: false, message: "GEMINI_API_KEY is missing" };
  try {
    const url = new URL(`${GEMINI_BASE}/models/${model}`);
    url.searchParams.set("key", key);
    const res = await fetch(url, { cache: "no-store" });
    return { ok: res.ok, status: res.status, message: res.ok ? undefined : await safeText(res) };
  } catch (err) {
    return errorCheck(err);
  }
}

async function safeText(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  return text.slice(0, 500) || res.statusText;
}

function errorCheck(err: unknown): Check {
  return {
    ok: false,
    message: err instanceof Error ? err.message : String(err),
  };
}
