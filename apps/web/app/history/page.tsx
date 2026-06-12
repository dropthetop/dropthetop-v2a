import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND, URLS, generations, buildGenerationUrl } from "@dropthetop/shared";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: `Corvette History | Eight Generations of America's Sports Car | ${BRAND.name}`,
  description:
    "Explore 70+ years of Corvette history from the 1953 C1 to today's mid-engine C8. Discover each generation's unique story, production statistics, and notable models.",
  alternates: { canonical: `${URLS.website}/history` },
  openGraph: {
    type: "website",
    title: "Corvette History | Eight Generations of America's Sports Car",
    description:
      "Explore 70+ years of Corvette history from the 1953 C1 to today's mid-engine C8. Discover each generation's unique story, production statistics, and notable models.",
    url: `${URLS.website}/history`,
    images: [{ url: `${URLS.website}/og-image.png` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Corvette History | Eight Generations of America's Sports Car",
    description:
      "Explore 70+ years of Corvette history from the 1953 C1 to today's mid-engine C8.",
    images: [`${URLS.website}/og-image.png`],
  },
};

const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Corvette History | Eight Generations of America's Sports Car",
  description:
    "Explore 70+ years of Corvette history from the 1953 C1 to today's mid-engine C8.",
  url: `${URLS.website}/history`,
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: URLS.website },
      { "@type": "ListItem", position: 2, name: "Corvette History", item: `${URLS.website}/history` },
    ],
  },
};

export default async function HistoryPage() {
  const supabase = await createClient();

  // Fetch page hero + generation card hero images in one query
  const { data: dbImages } = await supabase
    .from("generation_images")
    .select("generation_id, image_url, image_type")
    .eq("is_hero", true)
    .or("image_type.eq.history-card,generation_id.eq.history-page");

  const imageMap: Record<string, string> = {};
  (dbImages ?? []).forEach((img) => {
    imageMap[img.generation_id] = img.image_url;
  });

  const pageHeroImageUrl = imageMap["history-page"] ?? null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <div className="min-h-screen bg-background">
        <Header />
        <div style={{ height: "calc(4rem + var(--safe-area-top, 0px))" }} />

        {/* Page Hero */}
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            {pageHeroImageUrl ? (
              <Image
                src={pageHeroImageUrl}
                alt="Classic Corvette"
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
            <div className="hero-overlay absolute inset-0" />
          </div>

          <div className="relative z-10 text-center px-4">
            <h1 className="font-display text-6xl md:text-8xl text-foreground mb-2">CORVETTE</h1>
            <span className="font-display text-5xl md:text-7xl text-primary">HISTORY</span>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Eight generations of America&apos;s sports car, from 1953 to today
            </p>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              70+ Years of Innovation
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
              From the first hand-built roadster in 1953 to today&apos;s mid-engine supercar, the
              Corvette has continuously pushed the boundaries of American automotive engineering.
              Explore each generation&apos;s unique story.
            </p>
          </div>
        </section>

        {/* Generation Cards */}
        <section className="pb-12 md:pb-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {generations.map((gen, index) => {
                const cardImage = imageMap[gen.id.toLowerCase()] ?? gen.image;
                return (
                  <Link
                    key={gen.id}
                    href={buildGenerationUrl(gen.id)}
                    className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-border block"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Image
                      src={cardImage}
                      alt={gen.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                    {/* Year badge */}
                    <span className="absolute top-4 left-4 inline-block px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded z-10">
                      {gen.years}
                    </span>

                    <div className="absolute bottom-0 left-0 right-0 p-4 pt-8">
                      <h3 className="font-display text-3xl md:text-4xl text-foreground mb-0.5">
                        {gen.name}
                      </h3>
                      <p className="text-muted-foreground mb-2">{gen.tagline}</p>
                      <div className="flex items-center gap-4 text-sm text-foreground/70">
                        <span>{gen.totalProduced} produced</span>
                        <span>•</span>
                        <span>{gen.engineCount} engines</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
