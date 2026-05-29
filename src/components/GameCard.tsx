import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { GameSummary } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export function GameCard({ game }: { game: GameSummary }) {
  return (
    <Link
      href={`/games/${game.slug || game.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60"
    >
      <div className="relative aspect-[16/9] w-full bg-secondary">
        {game.background_image ? (
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-base font-semibold tracking-tight">{game.name}</h3>
          <div className="flex shrink-0 items-center gap-1 text-sm text-amber-300">
            <Star className="h-3.5 w-3.5 fill-current" />
            {game.rating?.toFixed(1) ?? "—"}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{formatDate(game.released)}</p>
        <div className="flex flex-wrap gap-1.5">
          {game.genres?.slice(0, 3).map((g) => (
            <Badge key={g.id} variant="secondary">
              {g.name}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
