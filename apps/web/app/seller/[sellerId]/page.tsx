import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRAND } from "@dropthetop/shared";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SellerProfileClient } from "./SellerProfileClient";
import type { ProfileListing, ProfileData } from "./SellerProfileClient";

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

function toProfileListing(raw: RawListing): ProfileListing {
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
    is_auction: null,
    image_url: getPrimaryImage(raw as Parameters<typeof getPrimaryImage>[0]),
  };
}

const LISTING_SELECT =
  "id, title, price, year, mileage, location_city, location_state, generation, stock_number, is_sold, is_bid_to, vehicle_condition, listing_type, video_url, is_external_listing, external_image_url, seller_id, managed_profile_id, negotiable, used_type, listing_images(image_url, is_primary, display_order)";

// ─── data fetch ───────────────────────────────────────────────────────────────

async function getSellerData(sellerId: string) {
  const supabase = await createClient();

  // Profile via RPC (bypasses profiles RLS for public data)
  const { data: profileRows } = await supabase.rpc("get_public_profile", {
    profile_id: sellerId,
  });
  const profile = profileRows?.[0] ?? null;
  if (!profile) return null;

  // Fetch listings in parallel
  const base = supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("seller_id", sellerId)
    .eq("status", "approved")
    .eq("is_external_listing", false)
    .order("created_at", { ascending: false });

  const [activeRes, bidToRes, soldRes] = await Promise.all([
    base.eq("is_sold", false).neq("is_bid_to", true),
    base.eq("is_sold", false).eq("is_bid_to", true),
    base.eq("is_sold", true),
  ]);

  return {
    profile,
    activeListings: (activeRes.data ?? []) as unknown as RawListing[],
    bidToListings: (bidToRes.data ?? []) as unknown as RawListing[],
    soldListings: (soldRes.data ?? []) as unknown as RawListing[],
  };
}

// ─── metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sellerId: string }>;
}): Promise<Metadata> {
  const { sellerId } = await params;
  const result = await getSellerData(sellerId);
  if (!result) return { title: `Seller Not Found | ${BRAND.name}` };

  const { profile } = result;
  const name =
    profile.is_dealer && profile.dealer_name
      ? profile.dealer_name
      : profile.first_name
        ? `${profile.first_name} ${profile.last_name ?? ""}`.trim()
        : "Seller";

  return {
    title: `${name} | Corvette Listings | ${BRAND.name}`,
    description: `Browse Corvette listings from ${name} on ${BRAND.name}.`,
    robots: { index: false, follow: true },
  };
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function SellerPage({
  params,
  searchParams,
}: {
  params: Promise<{ sellerId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { sellerId } = await params;
  const sp = await searchParams;

  const result = await getSellerData(sellerId);
  if (!result) notFound();

  const { profile, activeListings, bidToListings, soldListings } = result;

  const sellerName =
    profile.is_dealer && profile.dealer_name
      ? profile.dealer_name
      : profile.first_name
        ? `${profile.first_name} ${profile.last_name ?? ""}`.trim()
        : "Seller";

  const profileData: ProfileData = {
    name: sellerName,
    isDealer: !!profile.is_dealer,
    avatarUrl: profile.avatar_url ?? null,
    location: profile.location ?? null,
    website: profile.website ?? null,
    memberSince: profile.created_at ?? null,
  };

  // Back navigation: preserve inventory filters or fromListing
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

  // Link suffix appended to each listing card URL
  const p = new URLSearchParams({ from: "seller", sellerId });
  if (inventoryFilters) p.set("inventoryFilters", inventoryFilters);
  const linkSuffix = `?${p}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SellerProfileClient
        profile={profileData}
        activeListings={activeListings.map(toProfileListing)}
        bidToListings={bidToListings.map(toProfileListing)}
        soldListings={soldListings.map(toProfileListing)}
        backHref={backHref}
        backLabel={backLabel}
        linkSuffix={linkSuffix}
      />
      <Footer />
    </div>
  );
}
