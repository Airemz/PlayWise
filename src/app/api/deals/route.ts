import { NextResponse } from "next/server";
import { findCheapestDealForTitle } from "@/lib/cheapshark";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 });
    const price = await findCheapestDealForTitle(title);
    return NextResponse.json(price);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Deal lookup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
