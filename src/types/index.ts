export type Platform = {
  id: number;
  name: string;
  slug: string;
};

export type Genre = {
  id: number;
  name: string;
  slug: string;
};

export type Store = {
  id: number;
  name: string;
  slug: string;
};

export type Screenshot = {
  id: number;
  image: string;
};

export type Tag = {
  id: number;
  name: string;
  slug: string;
};

export type GameSummary = {
  id: number;
  slug: string;
  name: string;
  released: string | null;
  background_image: string | null;
  rating: number;
  metacritic: number | null;
  genres: Genre[];
  platforms: Platform[];
  parent_platforms?: { platform: Platform }[];
};

export type GameDetail = GameSummary & {
  description_raw: string;
  description: string;
  website: string | null;
  tags: Tag[];
  stores: { id: number; store: Store }[] | null;
  screenshots?: Screenshot[];
};

export type CheapSharkDeal = {
  gameID: string;
  steamAppID: string | null;
  cheapest: string;
  cheapestDealID: string;
  external: string;
  internalName: string;
  thumb: string;
};

export type CheapSharkPrice = {
  storeID: string;
  storeName?: string;
  dealID: string;
  price: string;
  retailPrice: string;
  savings: string;
  isOnSale: string;
  dealLink: string;
};

export type PriceSummary = {
  available: boolean;
  cheapest?: number;
  normal?: number;
  savings?: number;
  storeName?: string;
  dealLink?: string;
};

export type SavedGame = {
  _id?: string;
  userId: string;
  gameId: number;
  slug: string;
  name: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  genres: { id: number; name: string }[];
  platforms: { id: number; name: string }[];
  savedAt: Date;
};

export type Preferences = {
  genres: string[];
  platforms: string[];
  playstyle: string;
  difficulty: string;
  maxBudget: number;
};

export type Recommendation = {
  title: string;
  reason: string;
  matchScore: number;
  estimatedPrice?: number;
  withinBudget?: boolean;
  rawgId?: number;
  rawgSlug?: string;
  background_image?: string | null;
  dealLink?: string;
};

export type RecommendationRun = {
  _id?: string;
  userId: string;
  createdAt: Date;
  preferences: Preferences;
  savedGameNames: string[];
  recommendations: Recommendation[];
};
