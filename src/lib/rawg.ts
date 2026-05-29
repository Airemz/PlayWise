import type { GameDetail, GameSummary, Screenshot } from "@/types";

const BASE = "https://api.rawg.io/api";

function key(): string {
  const k = process.env.RAWG_API_KEY;
  if (!k) throw new Error("RAWG_API_KEY is not set");
  return k;
}

async function rawg<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("key", key());
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), { next: { revalidate: 60 * 10 } });
  if (!res.ok) {
    throw new Error(`RAWG ${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export type RawgListResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type SearchOptions = {
  search?: string;
  page?: number;
  page_size?: number;
  genres?: string;
  platforms?: string;
  ordering?: string;
};

export async function searchGames(opts: SearchOptions): Promise<RawgListResponse<GameSummary>> {
  return rawg<RawgListResponse<GameSummary>>("/games", {
    search: opts.search,
    page: opts.page ?? 1,
    page_size: opts.page_size ?? 20,
    genres: opts.genres,
    platforms: opts.platforms,
    ordering: opts.ordering ?? "-rating",
  });
}

export async function getGame(idOrSlug: string | number): Promise<GameDetail> {
  const detail = await rawg<GameDetail>(`/games/${idOrSlug}`);
  try {
    const shots = await rawg<RawgListResponse<Screenshot>>(`/games/${idOrSlug}/screenshots`);
    detail.screenshots = shots.results.slice(0, 6);
  } catch {
    detail.screenshots = [];
  }
  return detail;
}

export async function findGameByName(name: string): Promise<GameSummary | null> {
  const res = await searchGames({ search: name, page_size: 1 });
  return res.results[0] ?? null;
}
