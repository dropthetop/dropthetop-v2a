import type { Metadata } from "next";
import { BRAND, TAGLINES, URLS, LISTING_CARD_SELECT } from "@dropthetop/shared";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedListingsCarousel } from "@/components/home/FeaturedListingsCarousel";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { CallToAction } from "@/components/home/CallToAction";
import type { ListingCardData } from "@dropthetop/shared";

// ─── structured data ──────────────────────────────────────────────────────────

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND.name,
  description: `${TAGLINES.short} — the premier marketplace for buying and selling Corvettes`,
  url: URLS.website,
  logo: `${URLS.website}/og-image.png`,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "English",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND.name,
  url: URLS.website,
  potentialAction: {
    "@type": "SearchAction",
    target: `${URLS.website}/inventory?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

// ─── metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: `${BRAND.name} | ${TAGLINES.short}`,
  description:
    "The premier marketplace for buying and selling Corvettes. Browse curated listings from classic C1s to the latest C8s. Find your dream American sports car today.",
  keywords: [
    "Corvette",
    "Corvette for sale",
    "buy Corvette",
    "sell Corvette",
    "C8 Corvette",
    "classic Corvette",
    "sports car marketplace",
    "American sports car",
  ],
  alternates: { canonical: URLS.website },
  openGraph: {
    type: "website",
    title: `${BRAND.name} | ${TAGLINES.short}`,
    description:
      "The premier marketplace for buying and selling Corvettes. Find your dream American sports car.",
    url: URLS.website,
    images: [{ url: `${URLS.website}/og-image.png` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} | ${TAGLINES.short}`,
    description: "The premier marketplace for buying and selling Corvettes.",
    images: [`${URLS.website}/og-image.png`],
  },
};

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [heroResult, countResult, featuredResult] = await Promise.all([
    // Hero background image from DB
    supabase
      .from("generation_images")
      .select("image_url")
      .eq("generation_id", "homepage")
      .eq("is_hero", true)
      .maybeSingle(),

    // Active listings count
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("is_sold", false)
      .eq("is_bid_to", false)
      .gt("expiration_date", now),

    // Featured listings
    supabase
      .from("listings")
      .select(LISTING_CARD_SELECT)
      .eq("status", "approved")
      .eq("featured", true)
      .or("is_sold.is.null,is_sold.eq.false")
      .or("is_bid_to.is.null,is_bid_to.eq.false")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const heroImageUrl = heroResult.data?.image_url ?? "/heroes/home.jpg";
  const activeCount = countResult.count ?? 0;
  const featured = (featuredResult.data ?? []) as unknown as ListingCardData[];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <div className="min-h-screen bg-background">
        <Header />
        <div style={{ height: "calc(4rem + var(--safe-area-top, 0px))" }} />
        <main>
          <HeroSection heroImageUrl={heroImageUrl} activeCount={activeCount} />
          <FeaturedListingsCarousel listings={featured} />
          <WhyChooseUs />
          <CallToAction />
        </main>
        <Footer />
      </div>
    </>
  );
}
