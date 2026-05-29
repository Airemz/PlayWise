import Link from "next/link";
import Image from "next/image";
import { ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import type { Recommendation } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const href = rec.rawgSlug ? `/games/${rec.rawgSlug}` : rec.rawgId ? `/games/${rec.rawgId}` : null;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
      <div className="relative aspect-[16/9] w-full bg-secondary">
        {href ? (
          <Link href={href} aria-label={`View ${rec.title}`} className="block h-full w-full">
            {rec.background_image ? (
              <Image
                src={rec.background_image}
                alt={rec.title}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                No image available
              </div>
            )}
          </Link>
        ) : rec.background_image ? (
          <Image
            src={rec.background_image}
            alt={rec.title}
            fill
            sizes="(min-width: 1024px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image available
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge variant="default">{rec.matchScore}% match</Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-base font-semibold tracking-tight">
          {href ? (
            <Link href={href} className="hover:text-primary">
              {rec.title}
            </Link>
          ) : (
            rec.title
          )}
        </h3>
        <p className="text-sm text-muted-foreground">{rec.reason}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          {typeof rec.estimatedPrice === "number" ? (
            <Badge variant={rec.withinBudget ? "success" : "warning"} className="gap-1.5">
              {rec.withinBudget ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {formatPrice(rec.estimatedPrice)}{" "}
              {rec.withinBudget ? "within budget" : "over budget"}
            </Badge>
          ) : (
            <Badge variant="outline">Price unavailable</Badge>
          )}
          {rec.dealLink ? (
            <a
              href={rec.dealLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View deal <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
