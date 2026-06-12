"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Gauge, Calendar, Star, ExternalLink, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buildListingUrl } from "@dropthetop/shared";

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  year: number;
  mileage: number | null;
  location_city: string | null;
  location_state: string | null;
  generation: string;
  image_url: string | null;
  stock_number?: number | null;
  is_sold?: boolean | null;
  is_bid_to?: boolean | null;
  vehicle_condition?: string | null;
  listing_type?: string | null;
  video_url?: string | null;
  is_external_listing?: boolean | null;
  is_dealer?: boolean | null;
  dealer_name?: string | null;
  managed_profile_id?: string | null;
  seller_id?: string | null;
  is_auction?: boolean | null;
  negotiable?: boolean | null;
  used_type?: string | null;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  showFavoriteButton?: boolean;
  userId?: string | null;
  linkSuffix?: string | null;
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800";

export function ListingCard({
  id,
  title,
  price,
  year,
  mileage,
  location_city,
  location_state,
  generation,
  image_url,
  stock_number,
  is_sold,
  is_bid_to,
  vehicle_condition,
  listing_type,
  video_url,
  is_external_listing,
  is_dealer,
  dealer_name,
  managed_profile_id,
  seller_id,
  is_auction,
  negotiable,
  used_type,
  isFavorite = false,
  onToggleFavorite,
  showFavoriteButton = false,
  userId,
  linkSuffix = "",
}: ListingCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const displayImageUrl = image_url ?? PLACEHOLDER_IMAGE;
  const location = [location_city, location_state].filter(Boolean).join(", ");
  const listingUrl = buildListingUrl(stock_number, year, generation, title) + (linkSuffix ?? "");

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p);
  const formatMileage = (m: number) => new Intl.NumberFormat("en-US").format(m);
  const formatStock = (n: number) => n.toString().padStart(5, "0");

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      window.location.href = `/auth?redirect=${encodeURIComponent(listingUrl)}`;
      return;
    }
    onToggleFavorite?.(id);
  };

  return (
    <Link href={listingUrl} className="group">
      <div className="glass-card rounded-lg overflow-hidden card-hover h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {!imageLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
          <img
            src={displayImageUrl}
            alt={title}
            onLoad={() => setImageLoaded(true)}
            className={cn(
              "w-full h-full object-cover transition-all duration-500 group-hover:scale-110",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Top-left badges: generation + condition + listing type */}
          <div className="absolute top-3 left-3 z-20 flex gap-2 flex-wrap">
            <span className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded">
              {generation.toUpperCase()}
            </span>
            {vehicle_condition === "new" && (
              <Badge className="bg-orange-500 text-white border-orange-600 text-xs font-semibold uppercase tracking-wider">
                New
              </Badge>
            )}
            {listing_type === "certified" && (
              <Badge className="bg-emerald-500 text-white border-emerald-600 text-xs font-semibold uppercase tracking-wider">
                Certified
              </Badge>
            )}
          </div>

          {/* Top-right: favorite */}
          {showFavoriteButton && (
            <div className="absolute top-3 right-3 z-20">
              <Button
                variant="secondary"
                size="icon"
                className={cn(
                  "bg-background/80 hover:bg-background backdrop-blur-sm transition-all",
                  isFavorite && "text-amber-400 hover:text-amber-500"
                )}
                onClick={handleFavoriteClick}
              >
                <Star className={cn("w-4 h-4", isFavorite && "fill-current")} />
              </Button>
            </div>
          )}

          {/* Bottom-left: dealer / private badge */}
          <div className="absolute bottom-3 left-3 z-30">
            {is_external_listing ? (
              <span className="bg-blue-500 text-white border border-blue-600 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 px-2.5 py-0.5 rounded-full">
                <ExternalLink className="w-3 h-3" />
                {dealer_name || "External Listing"}
              </span>
            ) : is_dealer || dealer_name ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary text-primary-foreground border border-primary">
                {dealer_name || "Dealer"}
              </span>
            ) : (
              <Badge className="bg-primary text-primary-foreground border-primary text-xs font-semibold uppercase tracking-wider">
                Private Owner
              </Badge>
            )}
          </div>

          {/* Bottom-right: sold / bid-to / video / auction */}
          <div className="absolute bottom-3 right-3 z-20">
            {is_sold ? (
              <Badge className="bg-red-600 text-white border-red-700 text-xs font-semibold uppercase tracking-wider">
                Sold
              </Badge>
            ) : is_bid_to ? (
              <Badge className="bg-amber-500 text-amber-950 border-amber-600 text-xs font-semibold uppercase tracking-wider">
                Bid To
              </Badge>
            ) : video_url && !is_auction ? (
              <Badge className="bg-primary text-primary-foreground border-primary text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <Video className="w-3 h-3" />
                Video
              </Badge>
            ) : null}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-grow">
          <h3 className="font-display text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem] mb-1">
            {title}
          </h3>

          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <p className="font-display text-xl text-accent">{formatPrice(price)}</p>
              {negotiable && (
                <Badge variant="outline" className="border-accent text-accent text-xs px-1.5 py-0.5">
                  OBO
                </Badge>
              )}
            </div>
            {stock_number != null && (
              <span className="text-xs text-muted-foreground">#{formatStock(stock_number)}</span>
            )}
          </div>

          {location && (
            <div className="flex items-center gap-1 text-foreground mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium text-sm">{location}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{year}</span>
            </div>
            {mileage != null && (
              <div className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5" />
                <span>{formatMileage(mileage)} mi</span>
              </div>
            )}
            {used_type && (
              <span className="text-xs capitalize">{used_type.replace(/_/g, " ")}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
