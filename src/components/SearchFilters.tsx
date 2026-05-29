"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const GENRES = [
  { slug: "action", name: "Action" },
  { slug: "adventure", name: "Adventure" },
  { slug: "role-playing-games-rpg", name: "RPG" },
  { slug: "shooter", name: "Shooter" },
  { slug: "strategy", name: "Strategy" },
  { slug: "indie", name: "Indie" },
  { slug: "puzzle", name: "Puzzle" },
  { slug: "racing", name: "Racing" },
  { slug: "sports", name: "Sports" },
  { slug: "simulation", name: "Simulation" },
];

const PLATFORMS = [
  { slug: "4", name: "PC" },
  { slug: "187", name: "PS5" },
  { slug: "18", name: "PS4" },
  { slug: "186", name: "Xbox X/S" },
  { slug: "1", name: "Xbox One" },
  { slug: "7", name: "Switch" },
];

export function SearchFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const genres = (sp.get("genres") ?? "").split(",").filter(Boolean);
  const platforms = (sp.get("platforms") ?? "").split(",").filter(Boolean);

  const toggle = (key: "genres" | "platforms", value: string) => {
    const current = (sp.get(key) ?? "").split(",").filter(Boolean);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    const params = new URLSearchParams(sp.toString());
    if (next.length) params.set(key, next.join(","));
    else params.delete(key);
    params.delete("page");
    router.push(`/search?${params.toString()}`);
  };

  const clear = () => router.push("/search");

  const hasAny = genres.length > 0 || platforms.length > 0 || sp.get("q");

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card/40 p-4">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Genres</p>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => {
            const active = genres.includes(g.slug);
            return (
              <button
                key={g.slug}
                onClick={() => toggle("genres", g.slug)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  active
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                )}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Platforms
        </p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => {
            const active = platforms.includes(p.slug);
            return (
              <button
                key={p.slug}
                onClick={() => toggle("platforms", p.slug)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  active
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                )}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>
      {hasAny ? (
        <div>
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear all
          </Button>
        </div>
      ) : null}
    </div>
  );
}
