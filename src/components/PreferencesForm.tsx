"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { Preferences, Recommendation } from "@/types";

const GENRES = [
  "Action",
  "Adventure",
  "RPG",
  "Shooter",
  "Strategy",
  "Indie",
  "Puzzle",
  "Racing",
  "Sports",
  "Simulation",
  "Platformer",
  "Fighting",
];

const PLATFORMS = ["PC", "PS5", "PS4", "Xbox-Series", "Xbox-One", "Switch", "Mac"];

const PLAYSTYLES = ["Single-player", "Co-op", "Multiplayer", "Story-driven", "Open world", "Competitive"];

const DIFFICULTIES = ["Casual", "Moderate", "Challenging", "Hardcore"];

type Props = {
  onResults: (data: { id: string; recommendations: Recommendation[]; preferences: Preferences }) => void;
};

export function PreferencesForm({ onResults }: Props) {
  const [genres, setGenres] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [playstyle, setPlaystyle] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (list: string[], setList: (v: string[]) => void, v: string) => {
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const prefs: Preferences = {
        genres: genres.map((g) => g.toLowerCase()),
        platforms: platforms.map((p) => p.toLowerCase()),
        playstyle,
        difficulty,
        maxBudget: Number(maxBudget) || 0,
      };
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Recommendation failed");
      onResults({ id: data.id, recommendations: data.recommendations, preferences: data.preferences });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recommendation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-border bg-card p-6">
      <ChipGroup label="Genres" options={GENRES} selected={genres} onToggle={(v) => toggle(genres, setGenres, v)} />
      <ChipGroup
        label="Platforms"
        options={PLATFORMS}
        selected={platforms}
        onToggle={(v) => toggle(platforms, setPlatforms, v)}
      />
      <RadioGroup label="Playstyle" options={PLAYSTYLES} selected={playstyle} onSelect={setPlaystyle} />
      <RadioGroup label="Difficulty" options={DIFFICULTIES} selected={difficulty} onSelect={setDifficulty} />

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Max budget (USD)
        </label>
        <Input
          type="number"
          min="0"
          step="1"
          inputMode="decimal"
          value={maxBudget}
          onChange={(e) => setMaxBudget(e.target.value)}
          placeholder="0 = no limit"
          className="max-w-xs"
        />
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <Button type="submit" disabled={loading} className="gap-2" size="lg">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Generating with Gemini…" : "Get recommendations"}
      </Button>
    </form>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                active
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RadioGroup({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(active ? "" : opt)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                active
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
