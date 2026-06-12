// Types
export type { ListingImage, ListingCardData } from "./types/listing";
export { LISTING_CARD_SELECT, LISTING_CARD_SELECT_MINIMAL } from "./types/listing";
export type { NewsArticle, NewsSource, NewsCardVariant, NewsCardProps } from "./types/news";
export { GENERATION_LABELS, GENERATION_LABELS_SHORT, calculateReadingTime } from "./types/news";
export type { Database } from "./types/database";

// Constants
export { BRAND, TAGLINES, URLS, SOCIAL, SEO, COPYRIGHT, COMPANY } from "./constants/brand";

// Data
export { generations, getGenerationById } from "./data/generations";
export type { GenerationData } from "./data/generations";
export { productionStatsData, getProductionStatsByGenerationId } from "./data/productionStats";
export type { ProductionStats, YearlyProduction } from "./data/productionStats";
export { USED_TYPES, BODY_STYLES } from "./data/corvetteModels";
export { US_STATES } from "./data/usStates";

// Lib
export { cn } from "./lib/utils";
export { generateSlug, buildListingUrl, buildEditListingUrl, parseStockNumber } from "./lib/listing-url";
export { getPrimaryImage, getPrimaryImageFromArray } from "./lib/listing-image";
export type { ListingWithImages } from "./lib/listing-image";
export { enrichListingsWithDealerInfo, mapToListingCardProps } from "./lib/listing-card-helpers";
export { buildGenerationUrl, parseGenerationIdFromSlug, getGenerationCanonicalUrl } from "./lib/generation-url";

// Supabase
export { createSupabaseClient } from "./supabase/client";

// Queries
export * from "./queries";
