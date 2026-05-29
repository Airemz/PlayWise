import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Calendar, ExternalLink } from "lucide-react";
import { getGame } from "@/lib/rawg";
import { findCheapestDealForTitle } from "@/lib/cheapshark";
import { Badge } from "@/components/ui/Badge";
import { PriceBadge } from "@/components/PriceBadge";
import { SaveButton } from "@/components/SaveButton";
import { formatDate } from "@/lib/utils";

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let game;
  try {
    game = await getGame(id);
  } catch {
    notFound();
  }
  const price = await findCheapestDealForTitle(game.name);
  const description = stripHtml(game.description ?? "");
  const platforms = game.platforms?.map((entry) => entry.platform).filter(Boolean) ?? [];

  return (
    <article>
      <section className="relative">
        {game.background_image ? (
          <div className="relative h-[40vh] min-h-[260px] w-full overflow-hidden sm:h-[55vh]">
            <Image
              src={game.background_image}
              alt={game.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          </div>
        ) : (
          <div className="h-32 bg-secondary" />
        )}
      </section>

      <section className="container relative z-10 -mt-24 pb-16 sm:-mt-32">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {game.genres?.slice(0, 4).map((g) => (
                <Badge key={g.id} variant="secondary">
                  {g.name}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{game.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                {game.rating?.toFixed(1)} / 5
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(game.released)}
              </span>
              {game.metacritic ? (
                <span className="rounded border border-emerald-500/40 px-1.5 py-0.5 text-xs text-emerald-300">
                  Metacritic {game.metacritic}
                </span>
              ) : null}
            </div>
          </div>
          <div className="relative z-20">
            <SaveButton game={game} />
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-lg font-semibold">About</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {description || "No description available."}
              </p>
            </div>

            {game.screenshots && game.screenshots.length > 0 ? (
              <div>
                <h2 className="mb-3 text-lg font-semibold">Screenshots</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {game.screenshots.map((s) => (
                    <div key={s.id} className="relative aspect-video overflow-hidden rounded-lg">
                      <Image
                        src={s.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {game.tags?.length ? (
              <div>
                <h2 className="mb-2 text-lg font-semibold">Tags</h2>
                <div className="flex flex-wrap gap-1.5">
                  {game.tags.slice(0, 14).map((t) => (
                    <Badge key={t.id} variant="outline">
                      {t.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                PC Pricing
              </h3>
              <PriceBadge price={price} />
              {!price.available ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  No active PC deal found via CheapShark.
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Platforms
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {platforms.length ? (
                  platforms.map((p) => (
                    <Badge key={p.id} variant="secondary">
                      {p.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Unknown</span>
                )}
              </div>
            </div>

            {game.stores?.length ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Stores
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {game.stores.map((s) => (
                    <li key={s.id}>
                      <span className="text-muted-foreground">{s.store.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {game.website ? (
              <Link
                href={game.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Official site <ExternalLink className="h-3 w-3" />
              </Link>
            ) : null}
          </aside>
        </div>
      </section>
    </article>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}
