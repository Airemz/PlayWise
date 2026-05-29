import { ExternalLink, TagIcon } from "lucide-react";
import type { PriceSummary } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export function PriceBadge({ price }: { price: PriceSummary | null | undefined }) {
  if (!price?.available || price.cheapest === undefined) {
    return (
      <Badge variant="outline" className="gap-1.5">
        <TagIcon className="h-3 w-3" /> Price unavailable
      </Badge>
    );
  }

  const onSale = typeof price.savings === "number" && price.savings > 1;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={onSale ? "success" : "default"} className="gap-1.5">
        <TagIcon className="h-3 w-3" />
        {formatPrice(price.cheapest)}
        {price.storeName ? ` · ${price.storeName}` : ""}
      </Badge>
      {onSale && price.normal !== undefined ? (
        <span className="text-xs text-muted-foreground line-through">{formatPrice(price.normal)}</span>
      ) : null}
      {onSale ? (
        <span className="text-xs text-emerald-400">-{Math.round(Number(price.savings))}%</span>
      ) : null}
      {price.dealLink ? (
        <a
          href={price.dealLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View deal <ExternalLink className="h-3 w-3" />
        </a>
      ) : null}
    </div>
  );
}
