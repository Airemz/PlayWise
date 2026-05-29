import { Suspense } from "react";
import { SearchIcon } from "lucide-react";
import { searchGames } from "@/lib/rawg";
import { SearchBar } from "@/components/SearchBar";
import { SearchFilters } from "@/components/SearchFilters";
import { GameGrid, GameGridSkeleton } from "@/components/GameGrid";
import { EmptyState, ErrorState } from "@/components/EmptyState";

type Search = { [k: string]: string | string[] | undefined };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const genres = typeof sp.genres === "string" ? sp.genres : undefined;
  const platforms = typeof sp.platforms === "string" ? sp.platforms : undefined;
  const page = Number(typeof sp.page === "string" ? sp.page : "1") || 1;

  return (
    <div className="container py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Search games</h1>
        <p className="mt-2 text-muted-foreground">
          Powered by RAWG. Use filters to narrow by genre or platform.
        </p>
      </header>

      <div className="mb-6">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside>
          <Suspense fallback={null}>
            <SearchFilters />
          </Suspense>
        </aside>
        <section>
          <Suspense fallback={<GameGridSkeleton />}>
            <Results q={q} genres={genres} platforms={platforms} page={page} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

async function Results({
  q,
  genres,
  platforms,
  page,
}: {
  q?: string;
  genres?: string;
  platforms?: string;
  page: number;
}) {
  try {
    const data = await searchGames({ search: q, genres, platforms, page, page_size: 18 });
    if (!data.results.length) {
      return (
        <EmptyState
          icon={<SearchIcon className="h-8 w-8" />}
          title="No games match those filters"
          description="Try removing a filter or searching for a different title."
        />
      );
    }
    return <GameGrid games={data.results} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return <ErrorState message={message} />;
  }
}
