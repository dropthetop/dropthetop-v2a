import type { Metadata } from "next";
import { BRAND, URLS, getListings, getTabCounts, getGenerationCounts, generations } from "@dropthetop/shared";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { InventoryClient } from "./InventoryClient";
import type { ParsedFilters } from "./InventoryClient";
import type { ListingFilters } from "@dropthetop/shared";

// ─── param parsing ────────────────────────────────────────────────────────────

function parseFilters(sp: Record<string, string | undefined>): ParsedFilters {
  const tab = sp.tab === "bid_to" || sp.tab === "sold" ? sp.tab : "active";
  const generation = sp.generation ? sp.generation.split(",").filter((g) => generations.some((gen) => gen.id.toLowerCase() === g)) : [];
  const sort = ["price_asc", "price_desc", "year_asc", "year_desc", "mileage_asc"].includes(sp.sort ?? "") ? sp.sort! : "newest";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  return {
    tab,
    generation,
    sort,
    minPrice: sp.minPrice ?? "",
    maxPrice: sp.maxPrice ?? "",
    minYear: sp.minYear ?? "",
    maxYear: sp.maxYear ?? "",
    maxMileage: sp.maxMileage ?? "",
    bodyStyle: sp.bodyStyle ?? "",
    condition: sp.condition ?? "",
    usedType: sp.usedType ?? "",
    transmission: sp.transmission ?? "",
    sellerType: sp.sellerType ?? "",
    listingType: sp.listingType ?? "",
    page,
  };
}

function toListingFilters(f: ParsedFilters): ListingFilters {
  return {
    tab: f.tab,
    generation: f.generation.length ? f.generation : undefined,
    sort: f.sort as ListingFilters["sort"],
    minPrice: f.minPrice ? parseInt(f.minPrice, 10) : undefined,
    maxPrice: f.maxPrice ? parseInt(f.maxPrice, 10) : undefined,
    minYear: f.minYear ? parseInt(f.minYear, 10) : undefined,
    maxYear: f.maxYear ? parseInt(f.maxYear, 10) : undefined,
    maxMileage: f.maxMileage ? parseInt(f.maxMileage, 10) : undefined,
    bodyStyle: f.bodyStyle || undefined,
    condition: f.condition || undefined,
    usedType: f.usedType || undefined,
    transmission: f.transmission || undefined,
    sellerType: (f.sellerType as ListingFilters["sellerType"]) || undefined,
    listingType: f.listingType || undefined,
    page: f.page,
  };
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const genLabel =
    filters.generation.length === 1
      ? `${filters.generation[0].toUpperCase()} `
      : filters.generation.length > 1
      ? `${filters.generation.map((g) => g.toUpperCase()).join(", ")} `
      : "";

  const tabLabel = filters.tab === "sold" ? "Sold " : filters.tab === "bid_to" ? "Bid To " : "";
  const title = `${tabLabel}${genLabel}Corvettes for Sale | ${BRAND.name}`;
  const description =
    `Browse our curated selection of ${genLabel}Corvettes for sale. ` +
    `From classic C1s to the latest C8 Stingrays, find your dream Corvette.`;

  const pageUrl = `${URLS.website}/inventory`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      title: `Corvette Inventory | ${BRAND.name} Marketplace`,
      description,
      url: pageUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: `Corvette Inventory | ${BRAND.name} Marketplace`,
      description,
    },
  };
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const parsedFilters = parseFilters(sp);
  const listingFilters = toListingFilters(parsedFilters);

  const supabase = await createClient();

  const [{ listings, total, page, pageSize }, tabCounts, generationCounts, authResult] =
    await Promise.all([
      getListings(supabase, listingFilters),
      getTabCounts(supabase, listingFilters),
      getGenerationCounts(supabase, listingFilters),
      supabase.auth.getUser(),
    ]);

  const userId = authResult.data.user?.id ?? null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <InventoryClient
        listings={listings as any}
        total={total}
        pageSize={pageSize}
        tabCounts={tabCounts}
        generationCounts={generationCounts}
        userId={userId}
        filters={parsedFilters}
      />
      <Footer />
    </div>
  );
}
