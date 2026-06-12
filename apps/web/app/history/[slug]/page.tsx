import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Gauge, Zap, Settings, Calendar } from "lucide-react";
import {
  BRAND,
  URLS,
  generations,
  getGenerationById,
  parseGenerationIdFromSlug,
  buildGenerationUrl,
  getGenerationCanonicalUrl,
  getProductionStatsByGenerationId,
} from "@dropthetop/shared";
import { createClient } from "@/lib/supabase/server";
import { GENERATION_HISTORY_IMAGES } from "@/lib/generation-images";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { GenerationGallery } from "@/components/history/GenerationGallery";
import { ProductionStatsSection } from "@/components/history/ProductionStatsSection";

// ─── static params ────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return generations.map((gen) => {
    const fullUrl = buildGenerationUrl(gen.id);
    const slug = fullUrl.replace("/history/", "");
    return { slug };
  });
}

// ─── metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const generationId = parseGenerationIdFromSlug(slug);
  const generation = getGenerationById(generationId);
  if (!generation) return {};

  const canonicalUrl = getGenerationCanonicalUrl(generation.id);

  return {
    title: `${generation.name} (${generation.years}) | Corvette History | ${BRAND.name}`,
    description: `${generation.description} Learn about the history, production statistics, and notable models of the ${generation.name}.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      title: `${generation.name} (${generation.years}) | Corvette History`,
      description: `${generation.description} Learn about the history, production statistics, and notable models.`,
      url: canonicalUrl,
      images: [{ url: generation.heroImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${generation.name} (${generation.years}) | Corvette History`,
      description: generation.tagline,
      images: [generation.heroImage],
    },
  };
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function GenerationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const generationId = parseGenerationIdFromSlug(slug);
  const generation = getGenerationById(generationId);

  if (!generation) notFound();

  const productionStats = getProductionStatsByGenerationId(generationId);
  const currentIndex = generations.findIndex((g) => g.id === generation.id);
  const prevGen = currentIndex > 0 ? generations[currentIndex - 1] : null;
  const nextGen = currentIndex < generations.length - 1 ? generations[currentIndex + 1] : null;

  // Fetch DB images (hero + gallery)
  const supabase = await createClient();
  const { data: dbImages } = await supabase
    .from("generation_images")
    .select("image_url, is_hero, display_order")
    .eq("generation_id", generation.id.toLowerCase())
    .order("display_order", { ascending: true });

  const dbHeroUrl = dbImages?.find((img) => img.is_hero)?.image_url ?? null;
  const heroImageUrl =
    dbHeroUrl ??
    GENERATION_HISTORY_IMAGES[generation.id.toLowerCase()] ??
    generation.heroImage;
  const isLocalHero = !dbHeroUrl;
  const galleryImages =
    dbImages && dbImages.filter((img) => !img.is_hero).length > 0
      ? dbImages.filter((img) => !img.is_hero).map((img) => img.image_url)
      : generation.gallery;

  const canonicalUrl = getGenerationCanonicalUrl(generation.id);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${generation.name} (${generation.years}) | Corvette History`,
    description: generation.description,
    url: canonicalUrl,
    image: heroImageUrl,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: URLS.website },
        {
          "@type": "ListItem",
          position: 2,
          name: "Corvette History",
          item: `${URLS.website}/history`,
        },
        { "@type": "ListItem", position: 3, name: generation.name, item: canonicalUrl },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="min-h-screen bg-background">
        <Header />
        <div style={{ height: "calc(4rem + var(--safe-area-top, 0px))" }} />

        {/* Hero */}
        <section className={`relative flex items-end overflow-hidden ${isLocalHero ? "h-[65vh]" : "h-[70vh]"}`}>
          <div className="absolute inset-0">
            <Image
              src={heroImageUrl}
              alt={generation.name}
              fill
              className={isLocalHero ? "object-cover object-top" : "object-cover"}
              priority
            />
            <div className="hero-overlay absolute inset-0" />
          </div>

          {/* Back link */}
          <Link
            href="/history"
            className="absolute left-4 md:left-8 z-20 flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full text-foreground hover:bg-background transition-colors"
            style={{ top: "calc(5rem + var(--safe-area-top, 0px))" }}
          >
            <ArrowLeft className="w-4 h-4" />
            All Generations
          </Link>

          {/* Prev / Next arrow buttons */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex justify-between px-4">
            {prevGen ? (
              <Link
                href={buildGenerationUrl(prevGen.id)}
                className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                aria-label={`Previous generation: ${prevGen.name}`}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            ) : (
              <div />
            )}
            {nextGen && (
              <Link
                href={buildGenerationUrl(nextGen.id)}
                className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                aria-label={`Next generation: ${nextGen.name}`}
              >
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </Link>
            )}
          </div>

          <div className="relative z-10 container mx-auto px-4 pb-12">
            <span className="inline-block px-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded mb-4">
              {generation.years}
            </span>
            <h1 className="font-display text-5xl md:text-7xl text-foreground mb-3">
              {generation.name}
            </h1>
            <p className="text-xl text-muted-foreground">{generation.tagline}</p>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 md:py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-4xl text-foreground text-center mb-12">
              History &amp; Evolution
            </h2>
            <div className="max-w-3xl mx-auto space-y-8">
              {generation.timeline.map((event, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0 w-20">
                    <span className="text-primary font-semibold">{event.year}</span>
                  </div>
                  <div className="flex-1 pb-8 border-l border-border pl-6 relative">
                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary" />
                    <h3 className="font-display text-xl text-foreground mb-2">{event.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Photo Gallery */}
        {galleryImages.length > 0 && (
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-4xl text-foreground text-center mb-8">Gallery</h2>
              <div className="max-w-4xl mx-auto">
                <GenerationGallery images={galleryImages} generationName={generation.name} />
              </div>
            </div>
          </section>
        )}

        {/* Description & Stats */}
        <section className="py-16 md:py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-center leading-relaxed mb-16">
              {generation.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <Gauge className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-2xl font-semibold text-foreground">{generation.horsepowerRange}</p>
                <p className="text-sm text-muted-foreground">Horsepower Range</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-2xl font-semibold text-foreground">{generation.zeroToSixty}</p>
                <p className="text-sm text-muted-foreground">0-60 mph</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <Settings className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-2xl font-semibold text-foreground">{generation.topSpeed}</p>
                <p className="text-sm text-muted-foreground">Top Speed</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <Calendar className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-2xl font-semibold text-foreground">{generation.totalProduced}</p>
                <p className="text-sm text-muted-foreground">Units Produced</p>
              </div>
            </div>
          </div>
        </section>

        {/* Notable Models */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-4xl text-foreground text-center mb-12">
              Notable Models
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {generation.notableModels.map((model, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6">
                  <span className="text-primary text-sm font-semibold">{model.year}</span>
                  <h3 className="font-display text-2xl text-foreground mt-1 mb-2">{model.name}</h3>
                  <p className="text-muted-foreground">{model.highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Production Stats */}
        {productionStats && (
          <section className="py-16 md:py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-4xl text-foreground text-center mb-12">
                Production Statistics
              </h2>
              <ProductionStatsSection stats={productionStats} generationName={generation.name} />
            </div>
          </section>
        )}

        {/* Browse Inventory CTA */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Find Your {generation.name}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Browse our curated selection of {generation.name} Corvettes for sale
            </p>
            <Link href={`/inventory?generation=${generation.id.toLowerCase()}`}>
              <Button size="lg" className="btn-racing">
                Browse {generation.name} Listings
              </Button>
            </Link>
          </div>
        </section>

        {/* Prev / Next navigation */}
        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              {prevGen ? (
                <Link
                  href={buildGenerationUrl(prevGen.id)}
                  className="group flex items-center gap-3"
                >
                  <ArrowLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" />
                  <div>
                    <p className="text-sm text-muted-foreground">Previous</p>
                    <p className="font-display text-lg text-foreground">{prevGen.name}</p>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {nextGen && (
                <Link
                  href={buildGenerationUrl(nextGen.id)}
                  className="group flex items-center gap-3 text-right"
                >
                  <div>
                    <p className="text-sm text-muted-foreground">Next</p>
                    <p className="font-display text-lg text-foreground">{nextGen.name}</p>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-primary rotate-180 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
