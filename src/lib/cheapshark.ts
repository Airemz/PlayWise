import type { CheapSharkDeal, PriceSummary } from "@/types";

const BASE = "https://www.cheapshark.com/api/1.0";

let storesCache: Map<string, string> | null = null;

async function loadStores(): Promise<Map<string, string>> {
  if (storesCache) return storesCache;
  try {
    const res = await fetch(`${BASE}/stores`, { next: { revalidate: 60 * 60 * 24 } });
    if (!res.ok) return new Map();
    const data = (await res.json()) as { storeID: string; storeName: string }[];
    storesCache = new Map(data.map((s) => [s.storeID, s.storeName]));
    return storesCache;
  } catch {
    return new Map();
  }
}

export async function findCheapestDealForTitle(title: string): Promise<PriceSummary> {
  try {
    const url = new URL(`${BASE}/games`);
    url.searchParams.set("title", title);
    url.searchParams.set("limit", "5");
    url.searchParams.set("exact", "0");
    const res = await fetch(url.toString(), { next: { revalidate: 60 * 30 } });
    if (!res.ok) return { available: false };
    const matches = (await res.json()) as CheapSharkDeal[];
    if (!matches.length) return { available: false };

    const exact = matches.find((m) => m.external.toLowerCase() === title.toLowerCase());
    const pick = exact ?? matches[0];

    const detailUrl = new URL(`${BASE}/games`);
    detailUrl.searchParams.set("id", pick.gameID);
    const detailRes = await fetch(detailUrl.toString(), { next: { revalidate: 60 * 30 } });
    if (!detailRes.ok) return basicSummary(pick);
    const detail = (await detailRes.json()) as {
      info: { title: string; thumb: string };
      cheapestPriceEver: { price: string; date: number };
      deals: {
        storeID: string;
        dealID: string;
        price: string;
        retailPrice: string;
        savings: string;
        isOnSale: string;
      }[];
    };

    if (!detail.deals?.length) return basicSummary(pick);

    const stores = await loadStores();
    const sorted = [...detail.deals].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    const top = sorted[0];

    return {
      available: true,
      cheapest: parseFloat(top.price),
      normal: parseFloat(top.retailPrice),
      savings: parseFloat(top.savings),
      storeName: stores.get(top.storeID),
      dealLink: `https://www.cheapshark.com/redirect?dealID=${top.dealID}`,
    };
  } catch {
    return { available: false };
  }
}

function basicSummary(d: CheapSharkDeal): PriceSummary {
  const cheapest = parseFloat(d.cheapest);
  if (Number.isNaN(cheapest)) return { available: false };
  return {
    available: true,
    cheapest,
    dealLink: `https://www.cheapshark.com/redirect?dealID=${d.cheapestDealID}`,
  };
}

export async function findDealsForTitles(titles: string[]): Promise<Record<string, PriceSummary>> {
  const out: Record<string, PriceSummary> = {};
  await Promise.all(
    titles.map(async (t) => {
      out[t] = await findCheapestDealForTitle(t);
    })
  );
  return out;
}
