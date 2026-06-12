import type { Metadata } from "next";
import { BRAND, URLS, getNewsArticles, getFeaturedNewsArticles } from "@dropthetop/shared";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { NewsClient } from "./NewsClient";

export const metadata: Metadata = {
  title: `Corvette News | ${BRAND.name}`,
  description:
    "Stay up-to-date with the latest Corvette news, reviews, and announcements from top automotive sources. From C1 classics to the latest C8.",
  keywords: ["Corvette news", "C8 Corvette", "Stingray", "Z06", "ZR1", "E-Ray", "Corvette reviews"],
  alternates: { canonical: `${URLS.website}/news` },
  openGraph: {
    type: "website",
    title: `Corvette News | ${BRAND.name}`,
    description:
      "Stay informed with the latest Corvette news, reviews, and announcements from top automotive sources.",
    url: `${URLS.website}/news`,
  },
  twitter: {
    card: "summary_large_image",
    title: `Corvette News | ${BRAND.name}`,
    description: "The latest Corvette news, reviews, and announcements.",
  },
};

export default async function NewsPage() {
  const supabase = await createClient();

  const [featured, articles] = await Promise.all([
    getFeaturedNewsArticles(supabase, 3),
    getNewsArticles(supabase, { limit: 200 }),
  ]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Corvette News",
    url: `${URLS.website}/news`,
    itemListElement: articles.slice(0, 20).map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.title,
      url: a.source_url,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div className="min-h-screen bg-background">
        <Header />
        <NewsClient featured={featured} articles={articles} />
        <Footer />
      </div>
    </>
  );
}
