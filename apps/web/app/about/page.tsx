import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Wrench, Video, Users, Heart, Mail, Phone } from "lucide-react";
import { BRAND, TAGLINES, URLS } from "@dropthetop/shared";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: `Our Mission | ${BRAND.name} - ${TAGLINES.short}`,
  description: `Learn about ${BRAND.name}'s mission to connect Corvette enthusiasts with the finest classic models. Meet our expert and discover what sets us apart.`,
  alternates: { canonical: `${URLS.website}/about` },
  openGraph: {
    type: "website",
    title: `Our Mission | ${BRAND.name} - ${TAGLINES.short}`,
    description: `Learn about ${BRAND.name}'s mission to connect Corvette enthusiasts with the finest classic models.`,
    url: `${URLS.website}/about`,
    images: [{ url: `${URLS.website}/og-image.png` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Our Mission | ${BRAND.name}`,
    description: `Learn about ${BRAND.name}'s mission to connect Corvette enthusiasts with the finest classic models.`,
    images: [`${URLS.website}/og-image.png`],
  },
};

const FEATURE_CARDS = [
  {
    icon: Wrench,
    title: "Our Expert",
    body: `Our Corvette expert, Al Smith, brings over 30 years of experience as a mechanic specializing in the repair and restoration of classic Corvettes. His extensive knowledge and passion for these iconic vehicles allow us to provide you with unparalleled insights and confidence in your purchase.`,
  },
  {
    icon: Video,
    title: "What Sets Us Apart",
    body: `Our value proposition is simple yet powerful: we own each Corvette for sale and conduct detailed video reviews of each Corvette we list for sale. In each video, not only do we do an up-close walk around but we also go under the hood and underneath the car. This gives you an authentic, in-depth look at the craftsmanship, condition, and unique features of every Corvette, allowing you to make informed decisions with peace of mind.`,
  },
  {
    icon: Users,
    title: `Join the ${BRAND.short} Community`,
    body: `At ${BRAND.name}, we're not just selling cars; we're building a community of classic Corvette enthusiasts. We invite you to explore our collection, watch our expert reviews, and connect with fellow Corvette lovers. Whether you're looking to buy, sell, or just learn more about these legendary cars, ${BRAND.name} is here to help you every step of the way.`,
  },
  {
    icon: Heart,
    title: "History of DTT",
    body: `Drop the Top was started by Todd Alan as a way for Corvette enthusiasts to find quality classic or collectable Corvettes that are curated and ready to roll! Todd started his love affair with Corvettes when he was just 12 years old.`,
  },
];

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: heroData } = await supabase
    .from("generation_images")
    .select("image_url")
    .eq("generation_id", "mission-page")
    .eq("is_hero", true)
    .maybeSingle();

  const heroImageUrl = heroData?.image_url ?? "/heroes/about.png";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div style={{ height: "calc(4rem + var(--safe-area-top, 0px))" }} />

      {/* Hero */}
      <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImageUrl}
            alt="Classic Corvette"
            fill
            className="object-cover"
            priority
          />
          <div className="hero-overlay absolute inset-0" />
        </div>
        <div className="relative z-10 text-center px-4">
          <span className="inline-block px-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded mb-4">
            About Us
          </span>
          <h1 className="font-display text-5xl md:text-7xl text-foreground">DTT Mission</h1>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
              Welcome to {BRAND.name}, your premier marketplace dedicated to the passion and craftsmanship of classic
              Corvettes. We believe that every Corvette tells a story, and our mission is to connect enthusiasts with
              the finest classic models.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              At {BRAND.name}, we take pride in curating the best classic Corvettes, ensuring that each car we feature
              meets our high standards of quality and performance.
            </p>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="pb-10 md:pb-14">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {FEATURE_CARDS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">{title}</h2>
                    <p className="text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-10 md:py-14 bg-card/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-8">Contact DTT</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <a
              href={`mailto:${URLS.email.contact}`}
              className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
            >
              <Mail className="w-5 h-5 text-primary" />
              <span>{URLS.email.contact}</span>
            </a>
            <a
              href="tel:630-207-7444"
              className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-5 h-5 text-primary" />
              <span>630-207-7444</span>
            </a>
          </div>
          <Link href="/inventory">
            <Button size="lg" className="btn-racing">Browse Our Inventory</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
