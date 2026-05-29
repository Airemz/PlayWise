"use client";

import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { RecommendationCard } from "@/components/RecommendationCard";
import { EmptyState, ErrorState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import type { Recommendation, Preferences } from "@/types";

type Run = {
  _id: string;
  createdAt: string;
  preferences: Preferences;
  savedGameNames: string[];
  recommendations: Recommendation[];
};

export default function HistoryPage() {
  const [runs, setRuns] = useState<Run[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/recommend/history")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed");
        setRuns(data.items);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  return (
    <div className="container py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Recommendation history</h1>
        <p className="mt-2 text-muted-foreground">
          Your past AI recommendation runs. Stored anonymously to your browser session.
        </p>
      </header>

      {error ? <ErrorState message={error} /> : null}

      {!error && runs === null ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : null}

      {runs && runs.length === 0 ? (
        <EmptyState
          icon={<History className="h-8 w-8" />}
          title="No history yet"
          description="Once you generate recommendations on the Recommend page, runs will appear here."
        />
      ) : null}

      {runs && runs.length > 0 ? (
        <div className="space-y-8">
          {runs.map((run) => (
            <section key={run._id} className="rounded-2xl border border-border bg-card/40 p-6">
              <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(run.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {run.preferences.genres.map((g) => (
                      <Badge key={g} variant="secondary">
                        {g}
                      </Badge>
                    ))}
                    {run.preferences.platforms.map((p) => (
                      <Badge key={p} variant="outline">
                        {p}
                      </Badge>
                    ))}
                    {run.preferences.maxBudget > 0 ? (
                      <Badge variant="default">
                        ${run.preferences.maxBudget.toFixed(2)} budget
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {run.recommendations.length} recommendations
                </span>
              </header>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {run.recommendations.map((r, i) => (
                  <RecommendationCard key={i} rec={r} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
