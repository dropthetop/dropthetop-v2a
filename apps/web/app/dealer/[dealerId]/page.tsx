import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRAND } from "@dropthetop/shared";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  SellerProfileClient,
  type ProfileListing,
  type ProfileData,
} from "@/app/seller/[sellerId]/SellerProfileClient";

// ─── helpers ─────────────────────────────────────────────────────────────────

function getPrimaryImage(listing: {
  is_external_listing?: boolean | null;
  external_image_url?: string | null;
  listing_images?: { image_url: string; is_primary: boolean | null; display_order: number | null }[];
}): string | null {
  if (listing.is_external_listing && listing.external_image_url) {
    return listing.external_image_url;
  }
  const imgs = listing.listing_images ?? [];
  const sorted = [...imgs].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  return sorted.find((i) => i.is_primary)?.image_url ?? sorted[0]?.image_url ?? null;
}

type RawListing = Record<string, unknown> & {
  id: string;
  listing_images?: { image_url: string; is_primary: boolean | null; display_order: number | null }[];
};

function toProfileListing(raw: RawListing, isAuction: boolean): ProfileListing {
  return {
    id: raw.id,
    title: raw.title as string,
    price: raw.price as number,
    year: raw.year as number,
    mileage: (raw.mileage as number | null) ?? null,
    location_city: (raw.location_city as string | null) ?? null,
    location_state: (raw.location_state as string | null) ?? null,
    generation: raw.generation as string,
    stock_number: (raw.stock_number as number | null) ?? null,
    is_sold: (raw.is_sold as boolean | null) ?? null,
    is_bid_to: (raw.is_bid_to as boolean | null) ?? null,
    vehicle_condition: (raw.vehicle_condition as string | null) ?? null,
    listing_type: (raw.listing_type as string | null) ?? null,
    video_url: (raw.video_url as string | null) ?? null,
    is_external_listing: (raw.is_external_listing as boolean | null) ?? null,
    seller_id: (raw.seller_id as string | null) ?? null,
    managed_profile_id: (raw.managed_profile_id as string | null) ?? null,
    negotiable: (raw.negotiable as boolean | null) ?? null,
    used_type: (raw.used_type as string | null) ?? null,
    is_auction: isAuction,
    image_url: getPrimaryImage(raw as Parameters<typeof getPrimaryImage>[0]),
  };
}

const LISTING_SELECT =
  "id, title, price, year, mileage, location_city, location_state, generation, stock_number, is_sold, is_bid_to, vehicle_condition, listing_type, video_url, is_external_listing, external_image_url, seller_id, managed_profile_id, negotiable, used_type, listing_images(image_url, is_primary, display_order)";

// ─── data fetch ───────────────────────────────────────────────────────────────

async function getDealerData(dealerId: string) {
  const supabase = await createClient();

  const { data: dealer } = await supabase
    .from("managed_profiles")
    .select(
      "id, dealer_name, first_name, last_name, avatar_url, website, location_city, location_state, is_dealer, is_auction, created_at"
    )
    .eq("id", dealerId)
    .maybeSingle();

  if (!dealer) return null;

  const q = () =>
    supabase
      .from("listings")
      .select(LISTING_SELECT)
      .eq("managed_profile_id", dealerId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

  const [activeRes, bidToRes, soldRes] = await Promise.all([
    q().eq("is_sold", false).neq("is_bid_to", true),
    q().eq("is_sold", false).eq("is_bid_to", true),
    q().eq("is_sold", true),
  ]);

  return {
    dealer,
    activeListings: (activeRes.data ?? []) as unknown as RawListing[],
    bidToListings: (bidToRes.data ?? []) as unknown as RawListing[],
    soldListings: (soldRes.data ?? []) as unknown as RawListing[],
  };
}

// ─── metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dealerId: string }>;
}): Promise<Metadata> {
  const { dealerId } = await params;
  const result = await getDealerData(dealerId);
  if (!result) return { title: `Dealer Not Found | ${BRAND.name}` };

  const name = result.dealer.dealer_name ?? result.dealer.first_name ?? "Dealer";
  return {
    title: `${name} | Corvette Dealer | ${BRAND.name}`,
    description: `Browse Corvette listings from ${name} on ${BRAND.name}.`,
    robots: { index: false, follow: true },
  };
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function DealerPage({
  params,
  searchParams,
}: {
  params: Promise<{ dealerId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { dealerId } = await params;
  const sp = await searchParams;

  const result = await getDealerData(dealerId);
  if (!result) notFound();

  const { dealer, activeListings, bidToListings, soldListings } = result;
  const isAuction = !!dealer.is_auction;

  const dealerName = dealer.dealer_name ?? dealer.first_name ?? "Dealer";
  const location = [dealer.location_city, dealer.location_state].filter(Boolean).join(", ");

  const profileData: ProfileData = {
    name: dealerName,
    isDealer: true,
    isAuction,
    avatarUrl: dealer.avatar_url ?? null,
    location: location || null,
    website: dealer.website ?? null,
    memberSince: dealer.created_at ?? null,
  };

  const fromListing = sp.fromListing ?? null;
  const inventoryFilters = sp.inventoryFilters ?? null;

  let backHref = "/inventory";
  let backLabel = "Back to Marketplace";
  if (fromListing) {
    backHref = `/inventory/${fromListing}${inventoryFilters ? `?${inventoryFilters}` : ""}`;
    backLabel = "Back to Listing";
  } else if (inventoryFilters) {
    backHref = `/inventory?${inventoryFilters}`;
    backLabel = "Back to Marketplace";
  }

  const p = new URLSearchParams({ from: "dealer", sellerId: dealerId });
  if (inventoryFilters) p.set("inventoryFilters", inventoryFilters);
  const linkSuffix = `?${p}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SellerProfileClient
        profile={profileData}
        activeListings={activeListings.map((l) => toProfileListing(l, isAuction))}
        bidToListings={bidToListings.map((l) => toProfileListing(l, isAuction))}
        soldListings={soldListings.map((l) => toProfileListing(l, isAuction))}
        backHref={backHref}
        backLabel={backLabel}
        linkSuffix={linkSuffix}
      />
      <Footer />
    </div>
  );
}
