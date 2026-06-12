import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import { LISTING_CARD_SELECT } from "../types/listing";

export interface ListingFilters {
  tab?: "active" | "bid_to" | "sold";
  generation?: string | string[];
  sort?: "newest" | "price_asc" | "price_desc" | "year_asc" | "year_desc" | "mileage_asc";
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  transmission?: string;
  bodyStyle?: string;
  condition?: string;
  usedType?: string;
  sellerType?: "dealer" | "private";
  listingType?: string;
  isAuction?: boolean;
  page?: number;
  pageSize?: number;
}

const PAGE_SIZE = 24;
const now = () => new Date().toISOString();

function applyTabFilter(
  query: ReturnType<SupabaseClient<Database>["from"]>,
  tab: ListingFilters["tab"]
) {
  if (tab === "sold") {
    return (query as any).eq("is_sold", true);
  }
  if (tab === "bid_to") {
    return (query as any).eq("is_bid_to", true).eq("is_sold", false);
  }
  // active (default)
  return (query as any)
    .eq("is_sold", false)
    .eq("is_bid_to", false)
    .eq("status", "approved")
    .gt("expiration_date", now());
}

export async function getListings(
  client: SupabaseClient<Database>,
  filters: ListingFilters = {}
) {
  const {
    tab = "active",
    generation,
    sort = "newest",
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    maxMileage,
    transmission,
    bodyStyle,
    condition,
    usedType,
    sellerType,
    listingType,
    isAuction,
    page = 1,
    pageSize = PAGE_SIZE,
  } = filters;

  let query = client.from("listings").select(LISTING_CARD_SELECT, { count: "exact" });

  query = applyTabFilter(query as any, tab) as any;

  if (generation) {
    const gens = Array.isArray(generation) ? generation : [generation];
    if (gens.length === 1) {
      query = (query as any).eq("generation", gens[0]);
    } else if (gens.length > 1) {
      query = (query as any).in("generation", gens);
    }
  }

  if (minPrice !== undefined) query = (query as any).gte("price", minPrice);
  if (maxPrice !== undefined) query = (query as any).lte("price", maxPrice);
  if (minYear !== undefined) query = (query as any).gte("year", minYear);
  if (maxYear !== undefined) query = (query as any).lte("year", maxYear);
  if (maxMileage !== undefined) query = (query as any).lte("mileage", maxMileage);
  if (transmission) query = (query as any).eq("transmission", transmission);
  if (bodyStyle) query = (query as any).eq("body_style", bodyStyle);
  if (condition) query = (query as any).eq("vehicle_condition", condition);
  if (usedType) query = (query as any).eq("used_type", usedType);
  if (listingType) query = (query as any).eq("listing_type", listingType);

  if (sellerType === "dealer") query = (query as any).eq("is_dealer", true);
  if (sellerType === "private") query = (query as any).eq("is_dealer", false);

  if (isAuction !== undefined) {
    if (isAuction) {
      query = (query as any).not("managed_profile_id", "is", null);
    }
  }

  switch (sort) {
    case "price_asc":  query = (query as any).order("price", { ascending: true }); break;
    case "price_desc": query = (query as any).order("price", { ascending: false }); break;
    case "year_asc":   query = (query as any).order("year", { ascending: true }); break;
    case "year_desc":  query = (query as any).order("year", { ascending: false }); break;
    case "mileage_asc": query = (query as any).order("mileage", { ascending: true, nullsFirst: false }); break;
    default:           query = (query as any).order("created_at", { ascending: false }); break;
  }

  const from = (page - 1) * pageSize;
  query = (query as any).range(from, from + pageSize - 1);

  const { data, error, count } = await (query as any);
  // PGRST103 = requested range not satisfiable (page beyond available rows)
  if (error && (error as any).code !== "PGRST103") throw error;
  return { listings: data ?? [], total: count ?? 0, page, pageSize };
}

export async function getListingByStockNumber(
  client: SupabaseClient<Database>,
  stockNumber: number
) {
  const { data, error } = await client
    .from("listings")
    .select(`
      *,
      listing_images ( image_url, is_primary, display_order ),
      managed_profiles!managed_profile_id ( id, first_name, last_name, dealer_name, location_city, location_state, website, is_auction, avatar_url )
    `)
    .eq("stock_number", stockNumber)
    .single();

  if (error) throw error;
  return data;
}

export async function getListingSnapshot(
  client: SupabaseClient<Database>,
  listingId: string
) {
  const { data, error } = await client
    .from("listing_snapshots")
    .select("*")
    .eq("listing_id", listingId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}

export async function getFeaturedListings(
  client: SupabaseClient<Database>,
  limit = 8
) {
  const { data, error } = await client
    .from("listings")
    .select(LISTING_CARD_SELECT)
    .eq("status", "approved")
    .eq("is_sold", false)
    .eq("is_bid_to", false)
    .gt("expiration_date", now())
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getGenerationCounts(
  client: SupabaseClient<Database>,
  filters: Omit<ListingFilters, "generation" | "page">
) {
  const { tab = "active", ...rest } = filters;
  let query = client.from("listings").select("generation", { count: "exact" });
  query = applyTabFilter(query as any, tab) as any;

  const { data, error } = await (query as any);
  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const gen = row.generation as string;
    counts[gen] = (counts[gen] ?? 0) + 1;
  }
  return counts;
}

export async function getTabCounts(
  client: SupabaseClient<Database>,
  filters: Omit<ListingFilters, "tab" | "page">
) {
  const baseQuery = () => {
    let q = client.from("listings").select("id", { count: "exact" });
    if (filters.generation) {
      const gens = Array.isArray(filters.generation) ? filters.generation : [filters.generation];
      if (gens.length === 1) q = (q as any).eq("generation", gens[0]);
      else if (gens.length > 1) q = (q as any).in("generation", gens);
    }
    return q;
  };

  const [activeRes, bidToRes, soldRes] = await Promise.all([
    (baseQuery() as any)
      .eq("is_sold", false)
      .eq("is_bid_to", false)
      .eq("status", "approved")
      .gt("expiration_date", now()),
    (baseQuery() as any).eq("is_bid_to", true).eq("is_sold", false),
    (baseQuery() as any).eq("is_sold", true),
  ]);

  return {
    active: activeRes.count ?? 0,
    bid_to: bidToRes.count ?? 0,
    sold: soldRes.count ?? 0,
  };
}

export async function getSellerListings(
  client: SupabaseClient<Database>,
  sellerId: string
) {
  const { data, error } = await client
    .from("listings")
    .select(LISTING_CARD_SELECT)
    .eq("seller_id", sellerId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getDealerListings(
  client: SupabaseClient<Database>,
  managedProfileId: string
) {
  const { data, error } = await client
    .from("listings")
    .select(LISTING_CARD_SELECT)
    .eq("managed_profile_id", managedProfileId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
