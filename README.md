# PlayWise

AI-powered game discovery and PC price tracking. Search the RAWG library, see the cheapest current PC deal from CheapShark, save games to a personal shortlist, and get Gemini-generated recommendations grounded in real metadata, pricing, and your stated preferences.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + custom UI primitives (Button, Card, Input, Badge, Skeleton)
- MongoDB (Atlas or local) for saved games, preferences, and recommendation history
- RAWG API — game metadata
- CheapShark API — PC pricing
- Google Gemini — recommendations
- Anonymous user identity via signed cookie (no login required)

## Project layout

```
src/
  app/
    api/
      games/search/route.ts        GET /api/games/search
      games/[id]/route.ts          GET /api/games/:id
      deals/route.ts               GET /api/deals?title=
      saved/route.ts               GET/POST /api/saved
      saved/[id]/route.ts          DELETE /api/saved/:id
      recommend/route.ts           POST /api/recommend
      recommend/history/route.ts   GET /api/recommend/history
    page.tsx                       Landing
    search/page.tsx                Search w/ filters
    games/[id]/page.tsx            Detail (metadata + price)
    saved/page.tsx                 Saved games
    recommend/page.tsx             AI form + results
    recommend/history/page.tsx     Past runs
    layout.tsx, globals.css, not-found.tsx
  components/
    Navbar.tsx, Footer.tsx
    SearchBar.tsx, SearchFilters.tsx
    GameCard.tsx, GameGrid.tsx
    PriceBadge.tsx, SaveButton.tsx
    PreferencesForm.tsx, RecommendationCard.tsx
    EmptyState.tsx
    ui/Button.tsx ui/Input.tsx ui/Card.tsx ui/Badge.tsx ui/Skeleton.tsx
  lib/
    rawg.ts            RAWG client
    cheapshark.ts      CheapShark client
    gemini.ts          Gemini prompt + parser
    mongodb.ts         Mongo client + collections
    userId.ts          Anonymous-user cookie helper
    utils.ts           cn(), formatPrice(), formatDate()
  types/index.ts       Shared type definitions
```

## Setup

```bash
npm install
cp .env.local.example .env.local
# fill in the four required values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required environment variables

| Var | Where to get it |
|---|---|
| `RAWG_API_KEY` | https://rawg.io/apidocs |
| `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `MONGODB_DB` | Database name (defaults to `playwise`) |
| `GEMINI_MODEL` | Optional, defaults to `gemini-2.0-flash` |

CheapShark requires no key.

## How the AI recommendation flow works

1. The user submits preferences (genres, platforms, playstyle, difficulty, max budget).
2. The server reads the user's saved games from MongoDB.
3. The server fetches a candidate pool from RAWG filtered by the user's genre/platform prefs.
4. For each candidate, CheapShark is queried to attach a current cheapest PC deal where available.
5. A structured prompt is sent to Gemini containing saved games, prefs, and the priced candidate pool. Gemini returns JSON with title, reason, match score, estimated price, and budget fit.
6. The run is persisted to `recommendation_runs` and rendered on the page.

If CheapShark has no match for a game, the UI shows a clean "Price unavailable" badge instead of failing.

## Deploying to Vercel

1. Push to a Git provider.
2. Import the repo into Vercel.
3. Add the four environment variables in Project Settings → Environment Variables.
4. Deploy.

The MongoDB driver is pooled on the global object so it survives Vercel's serverless invocation model. RAWG and CheapShark responses are cached via `next: { revalidate }`.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — ESLint
