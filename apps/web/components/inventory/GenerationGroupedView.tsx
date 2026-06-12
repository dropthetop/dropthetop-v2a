"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generations } from "@dropthetop/shared";
import { ListingCard } from "@/components/listings/ListingCard";
import type { ListingCardData } from "@dropthetop/shared";

interface GenerationGroupedViewProps {
  listings: ListingCardData[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  userId: string | null;
  linkSuffix: string;
}

const GENERATION_ORDER = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];
const CARD_WIDTH = 280;
const GAP = 16;

export function GenerationGroupedView({
  listings,
  isFavorite,
  toggleFavorite,
  userId,
  linkSuffix,
}: GenerationGroupedViewProps) {
  const listingsByGeneration = listings.reduce<Record<string, ListingCardData[]>>((acc, l) => {
    const gen = l.generation?.toLowerCase();
    if (!gen) return acc;
    if (!acc[gen]) acc[gen] = [];
    acc[gen].push(l);
    return acc;
  }, {});

  const activeGenerations = GENERATION_ORDER.filter(
    (g) => (listingsByGeneration[g]?.length ?? 0) > 0
  );

  if (activeGenerations.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground text-lg">No listings available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {activeGenerations.map((genId) => (
        <GenerationRow
          key={genId}
          genId={genId}
          listings={listingsByGeneration[genId]}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
          userId={userId}
          linkSuffix={linkSuffix}
        />
      ))}
    </div>
  );
}

// ─── single generation row ────────────────────────────────────────────────────

interface GenerationRowProps {
  genId: string;
  listings: ListingCardData[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  userId: string | null;
  linkSuffix: string;
}

function GenerationRow({ genId, listings, isFavorite, toggleFavorite, userId, linkSuffix }: GenerationRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const genInfo = generations.find((g) => g.id.toLowerCase() === genId);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      setActiveIndex(Math.round(el.scrollLeft / (CARD_WIDTH + GAP)));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  const scrollToIndex = (index: number) => {
    scrollRef.current?.scrollTo({ left: index * (CARD_WIDTH + GAP), behavior: "smooth" });
  };

  return (
    <div>
      {/* Row header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-2xl md:text-3xl text-foreground">
            {genId.toUpperCase()}
            {genInfo && <span className="text-primary ml-2">({genInfo.years})</span>}
          </h3>
          <span className="text-muted-foreground text-sm">
            {listings.length} listing{listings.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => scroll("left")} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scroll("right")} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable cards */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory touch-pan-x"
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
            <div key={listing.id} className="flex-shrink-0 w-[280px] snap-start">
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
                isFavorite={isFavorite(listing.id)}
                onToggleFavorite={toggleFavorite}
                showFavoriteButton
                userId={userId}
                linkSuffix={linkSuffix}
              />
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      {listings.length > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          {listings.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex ? "bg-primary w-6" : "bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
