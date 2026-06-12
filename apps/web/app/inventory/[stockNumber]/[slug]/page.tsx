import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BRAND, URLS, parseStockNumber, buildListingUrl } from "@dropthetop/shared";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ListingDetailClient } from "./ListingDetailClient";
import type { HydratedListing, BackParams } from "./ListingDetailClient";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatMileage(mileage: number) {
  return new Intl.NumberFormat("en-US").format(mileage);
}

// ─── cached data fetch (deduplicates between generateMetadata + page) ────────

const getListingByStockNumber = cache(async (rawParam: string) => {
  const stockNum = parseStockNumber(rawParam);
  if (!stockNum) return null;

  const supabase = await createClient();

  const { data: raw, error } = await supabase
    .from("listings")
    .select(
      `*, listing_images(id, image_url, is_primary, display_order)`
    )
    .eq("stock_number", stockNum)
    .maybeSingle();

  if (error || !raw) return null;

  // Fetch seller profile via RPC (bypasses profiles RLS for public data)
  let sellerProfile: Record<string, unknown> | null = null;
  if (raw.seller_id) {
    const { data: profileRows } = await supabase.rpc("get_public_profile", {
      profile_id: raw.seller_id,
    });
    sellerProfile = profileRows?.[0] ?? null;
  }

  // Fetch managed profile if present
  let managedProfile: Record<string, unknown> | null = null;
  if (raw.managed_profile_id) {
    const { data } = await supabase
      .from("managed_profiles")
      .select(
        "id, first_name, last_name, avatar_url, is_dealer, dealer_name, website, location_city, location_state, created_at, fetch_all_images, is_auction"
      )
      .eq("id", raw.managed_profile_id)
      .maybeSingle();
    managedProfile = data ?? null;
  }

  let listing: Record<string, unknown> = {
    ...raw,
    profiles: sellerProfile,
    managed_profile: managedProfile,
  };

  // For pending_edited, show the approved snapshot version
  if (listing.status === "pending_edited") {
    const { data: snapshot } = await supabase
      .from("listing_snapshots")
      .select("*")
      .eq("listing_id", raw.id)
      .maybeSingle();

    if (!snapshot) return null; // rejected or missing → don't show

    const snapshotImages =
      (snapshot.image_urls as string[] | null)?.length
        ? (snapshot.image_urls as string[]).map((url, i) => ({
            id: `snapshot-${i}`,
            image_url: url,
            is_primary: i === 0,
            display_order: i,
          }))
        : (raw.listing_images as unknown[]);

    listing = {
      ...listing,
      title: snapshot.title,
      description: snapshot.description,
      price: snapshot.price,
      year: snapshot.year,
      generation: snapshot.generation,
      mileage: snapshot.mileage,
      transmission: snapshot.transmission,
      condition: snapshot.condition,
      engine: snapshot.engine,
      exterior_color: snapshot.exterior_color,
      interior_color: snapshot.interior_color,
      location_city: snapshot.location_city,
      location_state: snapshot.location_state,
      location_zip: snapshot.location_zip,
      vin: snapshot.vin,
      video_url: snapshot.video_url,
      listing_type: snapshot.listing_type,
      negotiable: snapshot.negotiable,
      model: snapshot.model,
      body_style: snapshot.body_style,
      used_type: snapshot.used_type,
      vehicle_condition: snapshot.vehicle_condition,
      listing_images: snapshotImages,
    };
  }

  return listing as unknown as HydratedListing;
});

// ─── seller listing counts ────────────────────────────────────────────────────

async function getSellerCounts(listing: HydratedListing) {
  const supabase = await createClient();
  const byManaged = !!listing.managed_profile_id && !!listing.managed_profile;

  let activeQ = (supabase.from("listings") as any)
    .select("id", { count: "exact", head: true })
    .eq("status", "approved")
    .eq("is_sold", false)
    .neq("is_bid_to", true);
  let soldQ = (supabase.from("listings") as any)
    .select("id", { count: "exact", head: true })
    .eq("status", "approved")
    .eq("is_sold", true);
  let bidToQ = (supabase.from("listings") as any)
    .select("id", { count: "exact", head: true })
    .eq("status", "approved")
    .eq("is_bid_to", true)
    .eq("is_sold", false);

  if (byManaged) {
    activeQ = activeQ.eq("managed_profile_id", listing.managed_profile_id);
    soldQ = soldQ.eq("managed_profile_id", listing.managed_profile_id);
    bidToQ = bidToQ.eq("managed_profile_id", listing.managed_profile_id);
  } else {
    activeQ = activeQ.eq("seller_id", listing.seller_id).eq("is_external_listing", false);
    soldQ = soldQ.eq("seller_id", listing.seller_id).eq("is_external_listing", false);
    bidToQ = bidToQ.eq("seller_id", listing.seller_id).eq("is_external_listing", false);
  }

  const [activeRes, soldRes, bidToRes] = await Promise.all([activeQ, soldQ, bidToQ]);

  return {
    active: (activeRes as any).count ?? 0,
    sold: (soldRes as any).count ?? 0,
    bidTo: (bidToRes as any).count ?? 0,
  };
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ stockNumber: string; slug: string }>;
}): Promise<Metadata> {
  const { stockNumber } = await params;
  const listing = await getListingByStockNumber(stockNumber);

  if (!listing) {
    return { title: `Listing Not Found | ${BRAND.name}` };
  }

  const location = [listing.location_city, listing.location_state]
    .filter(Boolean)
    .join(", ");

  const priceStr = formatPrice(listing.price);
  const metaTitle = `${listing.title} - ${priceStr} | ${BRAND.name}`;
  const metaDescription = [
    `${listing.year} Corvette ${listing.generation} - ${priceStr}`,
    listing.mileage ? `${formatMileage(listing.mileage)} miles` : null,
    location || null,
    "View details and contact the seller.",
  ]
    .filter(Boolean)
    .join(" - ");

  const images = (listing.listing_images ?? []).sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );
  const primaryImageUrl =
    listing.is_external_listing && listing.external_image_url
      ? listing.external_image_url
      : images[0]?.image_url ?? "";

  const listingPath = buildListingUrl(
    listing.stock_number,
    listing.year,
    listing.generation,
    listing.title
  );
  const pageUrl = `${URLS.website}${listingPath}`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      title: `${listing.title} - ${priceStr}`,
      description: metaDescription,
      url: pageUrl,
      images: primaryImageUrl ? [{ url: primaryImageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${listing.title} - ${priceStr}`,
      description: metaDescription,
      images: primaryImageUrl ? [primaryImageUrl] : [],
    },
  };
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ stockNumber: string; slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { stockNumber } = await params;
  const sp = await searchParams;

  const listing = await getListingByStockNumber(stockNumber);
  if (!listing) notFound();

  // Seller counts (parallel with any future fetches)
  const [counts, authResult] = await Promise.all([
    getSellerCounts(listing),
    createClient().then((s) => s.auth.getUser()),
  ]);

  const userId = authResult.data.user?.id ?? null;

  // Check favorites server-side for initial render
  let initialIsFavorited = false;
  if (userId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("listing_id", listing.id)
      .maybeSingle();
    initialIsFavorited = !!data;
  }

  // Sort images
  const images = (listing.listing_images ?? []).sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

  const primaryImageUrl =
    listing.is_external_listing && listing.external_image_url
      ? listing.external_image_url
      : images[0]?.image_url ?? "";

  const listingPath = buildListingUrl(
    listing.stock_number,
    listing.year,
    listing.generation,
    listing.title
  );
  const pageUrl = `${URLS.website}${listingPath}`;
  const location = [listing.location_city, listing.location_state]
    .filter(Boolean)
    .join(", ");
  const metaDescription = [
    `${listing.year} Corvette ${listing.generation} - ${formatPrice(listing.price)}`,
    listing.mileage ? `${formatMileage(listing.mileage)} miles` : null,
    location || null,
    "View details and contact the seller.",
  ]
    .filter(Boolean)
    .join(" - ");

  // Structured data
  const sellerName =
    listing.managed_profile?.is_dealer && listing.managed_profile?.dealer_name
      ? listing.managed_profile.dealer_name
      : listing.profiles?.dealer_name ??
        (listing.profiles?.first_name
          ? `${listing.profiles.first_name} ${listing.profiles.last_name ?? ""}`.trim()
          : "Seller");

  const vehicleSchema = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: listing.title,
    description: listing.description || metaDescription,
    image: primaryImageUrl,
    url: pageUrl,
    brand: { "@type": "Brand", name: "Chevrolet" },
    model: "Corvette",
    vehicleModelDate: String(listing.year),
    vehicleIdentificationNumber: listing.vin ?? undefined,
    mileageFromOdometer: listing.mileage
      ? { "@type": "QuantitativeValue", value: listing.mileage, unitCode: "SMI" }
      : undefined,
    vehicleTransmission: listing.transmission ?? undefined,
    color: listing.exterior_color ?? undefined,
    vehicleInteriorColor: listing.interior_color ?? undefined,
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: pageUrl,
      seller: {
        "@type": listing.profiles?.is_dealer ? "Organization" : "Person",
        name: sellerName,
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: URLS.website },
      { "@type": "ListItem", position: 2, name: "Inventory", item: `${URLS.website}/inventory` },
      { "@type": "ListItem", position: 3, name: listing.title, item: pageUrl },
    ],
  };

  const backParams: BackParams = {
    from: sp.from ?? null,
    sellerId: sp.sellerId ?? null,
    filters: sp.filters ?? null,
    inventoryFilters: sp.inventoryFilters ?? null,
    fromListing: sp.fromListing ?? null,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen bg-background">
        <Header />
        <ListingDetailClient
          listing={listing}
          images={images}
          sellerActiveCount={counts.active}
          sellerSoldCount={counts.sold}
          sellerBidToCount={counts.bidTo}
          initialIsFavorited={initialIsFavorited}
          userId={userId}
          backParams={backParams}
          pageUrl={pageUrl}
        />
        <Footer />
      </div>
    </>
  );
}
