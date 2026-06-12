"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import type { ListingCardData } from "@dropthetop/shared";

interface FeaturedListingsCarouselProps {
  listings: ListingCardData[];
}

export function FeaturedListingsCarousel({ listings }: FeaturedListingsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const cardWidth = window.innerWidth >= 768 ? 300 : 280;
      const gap = window.innerWidth >= 768 ? 24 : 16;
      setActiveIndex(Math.round(el.scrollLeft / (cardWidth + gap)));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = window.innerWidth >= 768 ? 300 : 280;
    const gap = window.innerWidth >= 768 ? 24 : 16;
    scrollRef.current.scrollTo({ left: index * (cardWidth + gap), behavior: "smooth" });
  };

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" });

  const showArrows = listings.length > 4;

  return (
    <section className="py-10 md:py-14 showroom-gradient">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-body text-accent uppercase tracking-[0.2em] text-sm mb-3">
              Premium Selection
            </p>
            <h2 className="font-display text-5xl md:text-6xl">FEATURED LISTINGS</h2>
          </div>
          <Link href="/inventory">
            <Button variant="outline" className="gap-2 uppercase tracking-wider">
              View All Inventory
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="relative">
          {showArrows && (
            <>
              <button
                onClick={scrollLeft}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 shadow-lg transition-all hover:scale-110 items-center justify-center"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <button
                onClick={scrollRight}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 shadow-lg transition-all hover:scale-110 items-center justify-center"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </>
          )}

          {listings.length === 0 ? (
            <div className="w-full text-center py-12">
              <p className="text-muted-foreground text-lg">No featured listings available at the moment.</p>
              <Link href="/inventory" className="text-primary hover:underline mt-2 inline-block">
                Browse all inventory
              </Link>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-4 md:gap-6 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory touch-pan-x"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {listings.map((listing) => {
                const primaryImage =
                  listing.listing_images?.find((i) => i.is_primary)?.image_url ??
                  listing.listing_images?.[0]?.image_url ??
                  null;
                const imageUrl =
                  listing.is_external_listing && listing.external_image_url
                    ? listing.external_image_url
                    : primaryImage;

                return (
                  <div key={listing.id} className="flex-shrink-0 w-[280px] md:w-[300px] snap-start">
                    <ListingCard
                      id={listing.id}
                      title={listing.title}
                      price={listing.price}
                      year={listing.year}
                      mileage={listing.mileage}
                      location_city={listing.location_city}
                      location_state={listing.location_state}
                      generation={listing.generation}
                      image_url={imageUrl}
                      stock_number={listing.stock_number}
                      is_sold={listing.is_sold}
                      is_bid_to={listing.is_bid_to}
                      vehicle_condition={listing.vehicle_condition}
                      listing_type={listing.listing_type}
                      video_url={listing.video_url}
                      is_external_listing={listing.is_external_listing}
                      is_dealer={listing.is_dealer}
                      dealer_name={listing.dealer_name}
                      managed_profile_id={listing.managed_profile_id}
                      seller_id={listing.seller_id}
                      is_auction={listing.managed_profiles?.is_auction}
                      negotiable={listing.negotiable}
                      used_type={listing.used_type}
                      linkSuffix="?from=home"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {listings.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {listings.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? "bg-primary w-6"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
