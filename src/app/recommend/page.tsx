"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, History } from "lucide-react";
import { PreferencesForm } from "@/components/PreferencesForm";
import { RecommendationCard } from "@/components/RecommendationCard";
import { EmptyState } from "@/components/EmptyState";
import type { Preferences, Recommendation } from "@/types";

export default function RecommendPage() {
  const [results, setResults] = useState<{
    id: string;
    recommendations: Recommendation[];
    preferences: Preferences;
  } | null>(null);

  return (
    <div className="container py-10">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI recommendations</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Tell PlayWise what you like. Gemini will recommend games grounded in real RAWG metadata
            and current PC pricing from CheapShark — including whether each pick fits your budget.
          </p>
        </div>
        <Link
          href="/recommend/history"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <History className="h-4 w-4" /> History
        </Link>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <PreferencesForm onResults={setResults} />

        <section>
          {!results ? (
            <EmptyState
              icon={<Sparkles className="h-8 w-8" />}
              title="Your recommendations will appear here"
              description="Pick a few preferences and click Get recommendations. Saving games first makes results sharper."
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card/40 p-4 text-sm text-muted-foreground">
                <p>
                  Based on{" "}
                  <span className="text-foreground">
                    {results.preferences.genres.join(", ") || "any genre"}
                  </span>
                  {results.preferences.maxBudget > 0
                    ? ` and a budget of $${results.preferences.maxBudget.toFixed(2)}`
                    : ""}
                  .
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {results.recommendations.map((r, i) => (
                  <RecommendationCard key={i} rec={r} />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
