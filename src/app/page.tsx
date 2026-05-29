import Link from "next/link";
import { ArrowRight, Search, Bookmark, Sparkles, TagIcon } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Search a real library",
    body: "Backed by the RAWG API: hundreds of thousands of games with metadata, cover art, ratings, and screenshots.",
  },
  {
    icon: TagIcon,
    title: "Track PC prices",
    body: "CheapShark surfaces the cheapest current deal — store, sale price, savings, and a direct link.",
  },
  {
    icon: Bookmark,
    title: "Build your shortlist",
    body: "Save games you're interested in. PlayWise remembers them anonymously, no account required.",
  },
  {
    icon: Sparkles,
    title: "AI that knows your taste",
    body: "Gemini grounds its recommendations in your saved games, preferences, budget, and real pricing data.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero-gradient">
        <div className="container py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> AI-powered, price-aware
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Find your next favorite game —
              <span className="bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">
                {" "}at the right price.
              </span>
            </h1>
            <p className="mt-6 text-base text-muted-foreground sm:text-lg">
              PlayWise blends real game metadata, current PC pricing, and Gemini AI to recommend
              games that actually match your taste and budget.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/search"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start searching <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/recommend"
                className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-transparent px-6 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Get AI recommendations
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-24">
        <div className="rounded-2xl border border-border bg-card/40 p-8 sm:p-12">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Ready to discover?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Save a few games you love, set your preferences, and let Gemini suggest the rest.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Browse games
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
