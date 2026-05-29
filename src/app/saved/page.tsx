"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, ErrorState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";

type SavedItem = {
  gameId: number;
  slug: string;
  name: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  genres?: { id: number; name: string }[];
};

export default function SavedPage() {
  const [items, setItems] = useState<SavedItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/saved");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: number) => {
    await fetch(`/api/saved/${id}`, { method: "DELETE" });
    setItems((cur) => cur?.filter((i) => i.gameId !== id) ?? null);
  };

  return (
    <div className="container py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Saved games</h1>
        <p className="mt-2 text-muted-foreground">
          Your shortlist powers AI recommendations on the Recommend page.
        </p>
      </header>

      {error ? <ErrorState message={error} /> : null}

      {!error && items === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : null}

      {items && items.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-8 w-8" />}
          title="No saved games yet"
          description="Save games from the search page or a detail page to start building your shortlist."
          action={
            <Link
              href="/search"
              className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse games
            </Link>
          }
        />
      ) : null}

      {items && items.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => (
            <li
              key={g.gameId}
              className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
            >
              <Link href={`/games/${g.slug || g.gameId}`} className="block">
                <div className="relative aspect-[16/9] w-full bg-secondary">
                  {g.background_image ? (
                    <Image
                      src={g.background_image}
                      alt={g.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, 50vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>
              </Link>
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/games/${g.slug || g.gameId}`} className="font-semibold hover:underline">
                    {g.name}
                  </Link>
                  <Button size="icon" variant="ghost" onClick={() => remove(g.gameId)} title="Remove">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(g.released)}</p>
                <div className="flex flex-wrap gap-1.5">
                  {g.genres?.slice(0, 3).map((gr) => (
                    <Badge key={gr.id} variant="secondary">
                      {gr.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
