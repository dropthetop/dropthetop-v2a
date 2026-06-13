"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  MapPin,
  Gauge,
  Calendar,
  CalendarDays,
  Settings,
  Palette,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  Share2,
  User,
  Video,
  ExternalLink,
  Clock,
  Mail,
  LogIn,
  Gavel,
  Timer,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { BRAND, buildListingUrl } from "@dropthetop/shared";
import { ContactSellerDialog } from "@/components/listings/ContactSellerDialog";
import { MakeOfferDialog } from "@/components/listings/MakeOfferDialog";

// ─── types ─────────────────────────────────────────────────────────────────

export interface ListingImage {
  id: string;
  image_url: string;
  is_primary: boolean | null;
  display_order: number | null;
}

export interface HydratedListing {
  id: string;
  title: string;
  price: number;
  year: number;
  mileage: number | null;
  generation: string;
  condition: string | null;
  transmission: string | null;
  engine: string | null;
  exterior_color: string | null;
  interior_color: string | null;
  vin: string | null;
  description: string | null;
  location_city: string | null;
  location_state: string | null;
  location_zip: string | null;
  negotiable: boolean | null;
  seller_id: string;
  managed_profile_id: string | null;
  video_url: string | null;
  listing_type: string | null;
  stock_number: number | null;
  vehicle_condition: string | null;
  model: string | null;
  body_style: string | null;
  used_type: string | null;
  is_sold: boolean | null;
  is_bid_to?: boolean | null;
  start_date: string | null;
  expiration_date: string | null;
  is_external_listing: boolean | null;
  external_url: string | null;
  external_image_url: string | null;
  listing_images: ListingImage[];
  status?: string | null;
  profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    location: string | null;
    is_dealer: boolean | null;
    dealer_name: string | null;
    created_at: string | null;
    website: string | null;
  } | null;
  managed_profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    is_dealer: boolean | null;
    dealer_name: string | null;
    website: string | null;
    location_city: string | null;
    location_state: string | null;
    created_at: string | null;
    fetch_all_images: boolean | null;
    is_auction: boolean | null;
  } | null;
}

export interface BackParams {
  from: string | null;
  sellerId: string | null;
  filters: string | null;
  inventoryFilters: string | null;
  fromListing: string | null;
}

interface Props {
  listing: HydratedListing;
  images: ListingImage[];
  sellerActiveCount: number;
  sellerSoldCount: number;
  sellerBidToCount: number;
  initialIsFavorited: boolean;
  userId: string | null;
  backParams: BackParams;
  pageUrl: string;
}

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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatStockNumber(num: number) {
  return num.toString().padStart(5, "0");
}

function getYouTubeEmbedUrl(url: string) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

// ─── Auction Countdown ───────────────────────────────────────────────────────

function AuctionCountdown({ expirationDate }: { expirationDate: string }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const expDate = new Date(expirationDate);
  const diff = expDate.getTime() - Date.now();
  const tzAbbr =
    expDate.toLocaleTimeString("en-US", { timeZoneName: "short" }).split(" ").pop() ?? "";

  if (diff <= 0) {
    return (
      <div className="flex items-center gap-1 text-destructive text-xs sm:text-sm">
        <Timer className="w-3 h-3 sm:w-4 sm:h-4" />
        Auction Ended
      </div>
    );
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return (
    <div className="w-full border border-amber-500/50 rounded-md px-2 sm:px-3 py-2 mt-3 flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-amber-600 dark:text-amber-400 text-center">
      <span className="flex items-center gap-1 text-xs sm:text-sm">
        <Timer className="w-3 h-3 sm:w-4 sm:h-4" />
        Auction Ends {format(expDate, "MMMM d, yyyy")} at{" "}
        {format(expDate, "h:mma").toLowerCase()} {tzAbbr}
      </span>
      <span className="w-full sm:w-auto font-mono text-[10px] sm:text-sm">
        ({parts.join(" ")})
      </span>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export function ListingDetailClient({
  listing,
  images,
  sellerActiveCount,
  sellerSoldCount,
  sellerBidToCount,
  initialIsFavorited,
  userId,
  backParams,
  pageUrl,
}: Props) {
  const titleSectionRef = useRef<HTMLDivElement>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [contactSellerOpen, setContactSellerOpen] = useState(false);
  const [makeOfferOpen, setMakeOfferOpen] = useState(false);

  // Sticky bar
  useEffect(() => {
    const handleScroll = () => {
      if (titleSectionRef.current) {
        setShowStickyBar(titleSectionRef.current.getBoundingClientRect().bottom < 80);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sortedImages = useMemo(() => {
    if (images.length) return images;
    if (listing.is_external_listing && listing.external_image_url) {
      return [{ id: "ext", image_url: listing.external_image_url, is_primary: true, display_order: 0 }];
    }
    return [];
  }, [images, listing.is_external_listing, listing.external_image_url]);

  // ── derived values ──────────────────────────────────────────────────────────

  const location = [listing.location_city, listing.location_state]
    .filter(Boolean)
    .join(", ");

  const effectiveProfile = listing.managed_profile ?? listing.profiles;
  const isManagedProfile = !!listing.managed_profile_id && !!listing.managed_profile;

  const sellerName =
    effectiveProfile?.is_dealer && effectiveProfile?.dealer_name
      ? effectiveProfile.dealer_name
      : effectiveProfile?.first_name
        ? `${effectiveProfile.first_name}${effectiveProfile.last_name ? ` ${effectiveProfile.last_name.charAt(0)}.` : ""}`
        : "Seller";

  const sellerType = effectiveProfile?.is_dealer ? "Dealer" : "Private Owner";
  const sellerSince = effectiveProfile?.created_at ? formatDate(effectiveProfile.created_at) : null;
  const sellerLocation = isManagedProfile
    ? [listing.managed_profile?.location_city, listing.managed_profile?.location_state]
        .filter(Boolean)
        .join(", ")
    : listing.profiles?.location ?? null;

  const isExternalListing = listing.is_external_listing === true;
  const isOwner = userId === listing.seller_id;

  // ── actions ─────────────────────────────────────────────────────────────────

  const toggleFavorite = async () => {
    if (!userId) {
      toast.info("Sign in to save this listing to your favorites.");
      return;
    }
    const supabase = createClient();
    if (isFavorited) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("listing_id", listing.id);
      if (!error) {
        setIsFavorited(false);
        toast.success("Removed from favorites");
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, listing_id: listing.id });
      if (!error) {
        setIsFavorited(true);
        toast.success("Added to favorites");
      }
    }
  };

  const handleShare = async () => {
    if (!listing.stock_number) return;
    const shareUrl = `${window.location.origin}${buildListingUrl(listing.stock_number, listing.year, listing.generation, listing.title)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: listing.title, url: shareUrl });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  // ── back navigation ──────────────────────────────────────────────────────────

  const { from, sellerId, filters, inventoryFilters, fromListing } = backParams;

  let backPath = "/inventory";
  let backLabel = "Back to the Marketplace";

  if (from === "home") {
    backPath = "/";
    backLabel = "Back to Home";
  } else if (from === "admin") {
    backPath = "/admin";
    backLabel = "Back to Admin Dashboard";
  } else if (from === "dashboard") {
    backPath = "/dashboard";
    backLabel = "Back to My Dashboard";
  } else if ((from === "seller" || from === "dealer") && sellerId) {
    const p = new URLSearchParams();
    if (fromListing) p.set("fromListing", fromListing);
    if (inventoryFilters) p.set("inventoryFilters", inventoryFilters);
    const base = from === "dealer" ? `/dealer/${sellerId}` : `/seller/${sellerId}`;
    backPath = `${base}${p.toString() ? `?${p}` : ""}`;
    backLabel = from === "dealer" ? "Back to Dealer Listings" : "Back to Seller Listings";
  } else if (from === "inventory") {
    backPath = filters ? `/inventory?${filters}` : "/inventory";
  } else if (inventoryFilters) {
    backPath = `/inventory?${inventoryFilters}`;
  }

  // ── listing type badge ───────────────────────────────────────────────────────

  const listingTypeBadge =
    listing.listing_type === "certified" ? (
      <Badge className="font-semibold uppercase tracking-wider bg-emerald-500 text-white border-emerald-600">
        Certified
      </Badge>
    ) : null;

  // ── expiration info ──────────────────────────────────────────────────────────

  const expirationInfo = useMemo(() => {
    if (!listing.expiration_date) return null;
    const daysUntil = Math.ceil(
      (new Date(listing.expiration_date).getTime() - Date.now()) / 86400000
    );
    if (daysUntil < 0)
      return { text: `Expired ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? "s" : ""} ago`, className: "text-destructive" };
    if (daysUntil === 0) return { text: "Expires today", className: "text-destructive" };
    if (daysUntil <= 7) return { text: `${daysUntil} day${daysUntil !== 1 ? "s" : ""} remaining`, className: "text-amber-500" };
    return { text: `${daysUntil} days remaining`, className: "text-muted-foreground" };
  }, [listing.expiration_date]);

  // ── seller listing links ─────────────────────────────────────────────────────

  function sellerTabLink(tab: "active" | "bidto" | "sold", profileId: string, isDealerPath: boolean) {
    const p = new URLSearchParams({ tab });
    if (fromListing) p.set("fromListing", fromListing ?? listing.id);
    if (inventoryFilters) p.set("inventoryFilters", inventoryFilters);
    const base = isDealerPath ? `/dealer/${profileId}` : `/seller/${profileId}`;
    return `${base}?${p}`;
  }


  // ── render ───────────────────────────────────────────────────────────────────

  // Seller id for dialogs — always the profiles.id (not managed_profile)
  const dialogSellerId = listing.seller_id;

  return (
    <>
      {/* Dialogs */}
      <ContactSellerDialog
        open={contactSellerOpen}
        onOpenChange={setContactSellerOpen}
        listingId={listing.id}
        sellerId={dialogSellerId}
        listingTitle={listing.title}
      />
      {listing.negotiable && (
        <MakeOfferDialog
          open={makeOfferOpen}
          onOpenChange={setMakeOfferOpen}
          listingId={listing.id}
          sellerId={dialogSellerId}
          listingTitle={listing.title}
          askingPrice={listing.price}
        />
      )}

      {/* Sticky Price Bar */}
      <div
        className={`fixed left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-300 ${
          showStickyBar ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
        style={{ top: "calc(4rem + var(--safe-area-top, 0px))" }}
      >
        <div className="container mx-auto px-4 py-2 md:py-4 max-w-4xl">
          {/* Mobile sticky */}
          <div className="flex flex-col gap-2 md:hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="font-display text-base truncate">{listing.title}</h2>
                <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5 shrink-0">
                  {listing.generation.toUpperCase()}
                </Badge>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={toggleFavorite}>
                  <Star className={`w-3.5 h-3.5 ${isFavorited ? "fill-amber-400 text-amber-400" : ""}`} />
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs border-primary" onClick={handleShare}>
                  <Share2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {listing.stock_number && (
                  <span className="text-xs text-muted-foreground">#{formatStockNumber(listing.stock_number)}</span>
                )}
                {listingTypeBadge}
                {listing.is_sold && (
                  <Badge className="bg-red-600 text-white text-xs font-semibold uppercase tracking-wider">Sold</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg text-accent">{formatPrice(listing.price)}</span>
                {listing.managed_profile?.is_auction && (
                  <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-600 dark:text-amber-400 text-xs px-1.5 py-0.5">
                    <Gavel className="w-3 h-3" />
                    Auction
                  </Badge>
                )}
                {listing.negotiable && (
                  <Badge variant="outline" className="border-accent text-accent text-xs px-1.5 py-0.5">OBO</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Desktop sticky */}
          <div className="hidden md:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <h2 className="font-display text-3xl truncate">{listing.title}</h2>
              <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1 shrink-0">
                {listing.generation.toUpperCase()}
              </Badge>
              {listing.stock_number && (
                <span className="text-sm text-muted-foreground shrink-0">
                  Stock #: {formatStockNumber(listing.stock_number)}
                </span>
              )}
              {listingTypeBadge}
              {listing.is_sold && (
                <Badge className="bg-red-600 text-white text-sm font-semibold uppercase tracking-wider shrink-0">Sold</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-display text-4xl text-accent">{formatPrice(listing.price)}</span>
              {listing.managed_profile?.is_auction && (
                <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-600 dark:text-amber-400">
                  <Gavel className="w-3 h-3" />
                  Auction
                </Badge>
              )}
              {listing.negotiable && (
                <Badge variant="outline" className="border-accent text-accent text-xs px-2 py-0.5 shrink-0">OBO</Badge>
              )}
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={toggleFavorite}>
                  <Star className={`w-4 h-4 ${isFavorited ? "fill-amber-400 text-amber-400" : ""}`} />
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-primary" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main style={{ paddingTop: "calc(5rem + var(--safe-area-top, 0px))" }}>
        {/* Back navigation */}
        <div className="container mx-auto px-4 py-2">
          <Link href={backPath} className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backLabel}
          </Link>
        </div>

        <div className="container mx-auto px-4 pb-12 max-w-4xl">
          <div className="space-y-5">

            {/* Title, price, actions */}
            <div ref={titleSectionRef} className="glass-card rounded-lg p-4">
              {/* Mobile */}
              <div className="flex flex-col gap-3 md:hidden">
                <div className="flex items-start justify-between gap-2">
                  <h1 className="font-display text-2xl leading-tight">{listing.title}</h1>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-9 w-9 ${isFavorited ? "text-amber-400 border-amber-400" : ""}`}
                      onClick={toggleFavorite}
                    >
                      <Star className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9 border-primary" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-3xl text-accent">{formatPrice(listing.price)}</span>
                  {listing.managed_profile?.is_auction && (
                    <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-600 dark:text-amber-400">
                      <Gavel className="w-3 h-3" />
                      Auction
                    </Badge>
                  )}
                  {listing.negotiable && (
                    <Badge variant="outline" className="text-xs border-accent text-accent">OBO</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {listing.stock_number && (
                    <span className="text-sm text-muted-foreground">
                      Stock #: {formatStockNumber(listing.stock_number)}
                    </span>
                  )}
                  {listingTypeBadge}
                  {listing.is_sold && (
                    <Badge className="bg-red-600 text-white text-xs font-semibold uppercase tracking-wider">Sold</Badge>
                  )}
                </div>
                {location && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full w-fit transition-colors group"
                  >
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-foreground font-medium text-sm">{location}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
              </div>

              {/* Desktop */}
              <div className="hidden md:flex md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="font-display text-3xl">{listing.title}</h1>
                    {listingTypeBadge}
                    {listing.is_sold && (
                      <Badge className="bg-red-600 text-white text-sm font-semibold uppercase tracking-wider">Sold</Badge>
                    )}
                  </div>
                  {listing.stock_number && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Stock #: {formatStockNumber(listing.stock_number)}
                    </p>
                  )}
                  {location && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full w-fit transition-colors group"
                    >
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-foreground font-medium">{location}</span>
                      <ExternalLink className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-4xl text-accent">{formatPrice(listing.price)}</span>
                    {listing.managed_profile?.is_auction && (
                      <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-600 dark:text-amber-400">
                        <Gavel className="w-3 h-3" />
                        Auction
                      </Badge>
                    )}
                    {listing.negotiable && (
                      <Badge variant="outline" className="text-xs border-accent text-accent">OBO</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleFavorite}
                      className={isFavorited ? "text-amber-400 border-amber-400" : ""}
                    >
                      <Star className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="outline" className="border-primary" onClick={handleShare}>
                      <Share2 className="w-5 h-5" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Image gallery */}
            <div className="relative rounded-lg overflow-hidden glass-card">
              <div className="aspect-[16/10] relative">
                {sortedImages.length > 0 ? (
                  <img
                    src={sortedImages[currentImageIndex].image_url}
                    alt={`${listing.title} ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    No images available
                  </div>
                )}

                {sortedImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((p) => (p - 1 + sortedImages.length) % sortedImages.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((p) => (p + 1) % sortedImages.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {sortedImages.length}
                    </div>
                  </>
                )}

                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
                    {listing.generation.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {sortedImages.length > 1 && (
                <div className="flex flex-wrap gap-2 p-3">
                  {sortedImages.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-20 h-16 rounded overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={`${listing.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* External listing notice */}
            {isExternalListing && listing.external_url && (
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="text-foreground font-medium">
                      This listing is hosted by:{" "}
                      <strong>
                        {listing.managed_profile?.dealer_name ??
                          listing.managed_profile?.first_name ??
                          "External Site"}
                      </strong>
                    </span>
                  </div>
                  <a href={listing.external_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500/10 whitespace-nowrap">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Listing
                    </Button>
                  </a>
                </div>
                {!listing.is_sold && listing.managed_profile?.is_auction && listing.expiration_date && (
                  <AuctionCountdown expirationDate={listing.expiration_date} />
                )}
              </div>
            )}

            {/* External iframe preview */}
            {isExternalListing && listing.external_url && listing.managed_profile?.fetch_all_images !== true && (
              <div className="glass-card rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-2xl">LISTING PREVIEW</h2>
                  <a href={listing.external_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Open in New Tab
                    </Button>
                  </a>
                </div>
                <div className="aspect-[16/26] md:aspect-[16/14] rounded-lg overflow-hidden border border-border relative">
                  {iframeLoading && !iframeError && (
                    <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center z-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3" />
                      <p className="text-muted-foreground text-sm">Loading preview...</p>
                    </div>
                  )}
                  {iframeError && (
                    <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center text-center p-6 z-10">
                      <ExternalLink className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">This site doesn&apos;t allow previews.</p>
                      <a href={listing.external_url} target="_blank" rel="noopener noreferrer">
                        <Button className="gap-2">
                          <ExternalLink className="w-4 h-4" />
                          View Full Listing
                        </Button>
                      </a>
                    </div>
                  )}
                  <iframe
                    src={listing.external_url}
                    title="External Listing Preview"
                    className={`w-full h-full ${iframeError ? "invisible" : ""}`}
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    onLoad={() => setIframeLoading(false)}
                    onError={() => { setIframeLoading(false); setIframeError(true); }}
                  />
                </div>
              </div>
            )}

            {/* Walk-around video */}
            {listing.video_url && !isExternalListing && (
              <div className="glass-card rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Video className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-2xl">WALK AROUND VIDEO</h2>
                </div>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={getYouTubeEmbedUrl(listing.video_url)}
                    title="Walk Around Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Listing info — owner only */}
            {isOwner && (listing.start_date || listing.expiration_date) && (
              <div className="glass-card rounded-lg p-3 md:p-4">
                <h2 className="font-display text-xl md:text-2xl mb-3 md:mb-4">LISTING INFO</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  {listing.start_date && (
                    <div className="space-y-0.5 md:space-y-1">
                      <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">Start Date</p>
                      <p className="font-semibold text-sm md:text-base flex items-center gap-1.5 md:gap-2">
                        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                        {new Date(listing.start_date).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                  {listing.expiration_date && (
                    <div className="space-y-0.5 md:space-y-1">
                      <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">Expiration Date</p>
                      <p className="font-semibold text-sm md:text-base flex items-center gap-1.5 md:gap-2">
                        <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                        {new Date(listing.expiration_date).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                  {expirationInfo && (
                    <div className="space-y-0.5 md:space-y-1">
                      <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">Status</p>
                      <p className={`font-semibold text-sm md:text-base flex items-center gap-1.5 md:gap-2 ${expirationInfo.className}`}>
                        <CalendarDays className={`w-3.5 h-3.5 md:w-4 md:h-4 ${expirationInfo.className}`} />
                        {expirationInfo.text}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vehicle details */}
            <div className="glass-card rounded-lg p-3 md:p-4">
              <h2 className="font-display text-xl md:text-2xl mb-3 md:mb-4">VEHICLE DETAILS</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">

                <div className="space-y-0.5 md:space-y-1">
                  <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">Year</p>
                  <p className="font-semibold text-sm md:text-base flex items-center gap-1.5 md:gap-2">
                    <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                    {listing.year}
                  </p>
                </div>

                {listing.mileage !== null && (
                  <div className="space-y-0.5 md:space-y-1">
                    <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">Mileage</p>
                    <p className="font-semibold text-sm md:text-base flex items-center gap-1.5 md:gap-2">
                      <Gauge className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                      {formatMileage(listing.mileage)} mi
                    </p>
                  </div>
                )}

                <div className="space-y-0.5 md:space-y-1">
                  <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">Generation</p>
                  <p className="font-semibold text-sm md:text-base">{listing.generation.toUpperCase()}</p>
                </div>

                {listing.model && (
                  <div className="space-y-0.5 md:space-y-1">
                    <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">Model</p>
                    <p className="font-semibold text-sm md:text-base">{listing.model}</p>
                  </div>
                )}

                {listing.body_style && (
                  <div className="space-y-0.5 md:space-y-1">
                    <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">Body Style</p>
                    <p className="font-semibold text-sm md:text-base capitalize">{listing.body_style}</p>
                  </div>
                )}

                <div className="space-y-0.5 md:space-y-1">
                  <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">New/Used</p>
                  <p className="font-semibold text-sm md:text-base capitalize">
                    {listing.vehicle_condition ?? "Used"}
                  </p>
                </div>

                {listing.used_type && listing.vehicle_condition === "used" && (
                  <div className="space-y-0.5 md:space-y-1">
                    <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">Used Type</p>
                    <p className="font-semibold text-sm md:text-base">
                      {({
                        body_off_restored: "Body Off Restored",
                        light_restored: "Light Restored",
                        survivor: "Survivor",
                        daily_driver: "Daily Driver",
                        restomod: "Restomod",
                        project_car: "Project Car",
                      } as Record<string, string>)[listing.used_type] ?? listing.used_type}
                    </p>
                  </div>
                )}

                {listing.transmission && (
                  <div className="space-y-0.5 md:space-y-1">
                    <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">Transmission</p>
                    <p className="font-semibold text-sm md:text-base flex items-center gap-1.5 md:gap-2">
                      <Settings className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                      {listing.transmission.charAt(0).toUpperCase() + listing.transmission.slice(1)}
                    </p>
                  </div>
                )}

                {listing.engine && (
                  <div className="space-y-0.5 md:space-y-1">
                    <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">Engine</p>
                    <p className="font-semibold text-sm md:text-base">{listing.engine}</p>
                  </div>
                )}

                {listing.condition && (
                  <div className="space-y-0.5 md:space-y-1">
                    <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">Condition</p>
                    <p className="font-semibold text-sm md:text-base capitalize">{listing.condition}</p>
                  </div>
                )}

                {listing.exterior_color && (
                  <div className="space-y-0.5 md:space-y-1">
                    <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">Exterior</p>
                    <p className="font-semibold text-sm md:text-base flex items-center gap-1.5 md:gap-2">
                      <Palette className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                      {listing.exterior_color}
                    </p>
                  </div>
                )}

                {listing.interior_color && (
                  <div className="space-y-0.5 md:space-y-1">
                    <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">Interior</p>
                    <p className="font-semibold text-sm md:text-base">{listing.interior_color}</p>
                  </div>
                )}

                {listing.vin && (
                  <div className="space-y-0.5 md:space-y-1 col-span-2 md:col-span-3">
                    <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">VIN</p>
                    <p className="font-mono text-xs md:text-sm">{listing.vin}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="glass-card rounded-lg p-4">
                <h2 className="font-display text-2xl mb-3">DESCRIPTION</h2>
                <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Seller info */}
            <div className="glass-card rounded-lg p-4">
              <p className="text-muted-foreground text-sm uppercase tracking-wider mb-3">Seller</p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  {effectiveProfile?.avatar_url ? (
                    <img
                      src={effectiveProfile.avatar_url}
                      alt={sellerName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <Link
                    href={
                      isManagedProfile
                        ? sellerTabLink("active", listing.managed_profile_id!, true)
                        : sellerTabLink("active", listing.seller_id, false)
                    }
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline transition-colors"
                  >
                    {sellerName}
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  </Link>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge
                      variant={effectiveProfile?.is_dealer ? "default" : "outline"}
                      className={
                        effectiveProfile?.is_dealer
                          ? "bg-accent/20 text-accent border-accent/30 text-xs"
                          : "border-2 border-muted-foreground/50 text-xs"
                      }
                    >
                      {sellerType}
                    </Badge>
                    {listing.managed_profile?.is_auction && (
                      <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-600 dark:text-amber-400 text-xs">
                        <Gavel className="w-3 h-3" />
                        Auction
                      </Badge>
                    )}
                  </div>
                  {effectiveProfile?.website && (
                    <a
                      href={effectiveProfile.website.startsWith("http") ? effectiveProfile.website : `https://${effectiveProfile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline text-sm mt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {effectiveProfile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
                {sellerLocation && (
                  <div className="text-center py-2 px-3 rounded-md bg-muted flex flex-col justify-between">
                    <p className="font-display text-lg text-primary truncate" title={sellerLocation}>
                      {sellerLocation}
                    </p>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Location</p>
                  </div>
                )}
                {sellerSince && (
                  <div className="text-center py-2 px-3 rounded-md bg-muted flex flex-col justify-between">
                    <p className="font-display text-lg text-primary">{sellerSince}</p>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Member Since</p>
                  </div>
                )}

                {/* Seller listing counts */}
                <div className="col-span-2 sm:col-span-3 grid grid-cols-3 gap-2">
                  {isManagedProfile ? (
                    <>
                      <Link href={sellerTabLink("active", listing.managed_profile_id!, true)}
                        className="text-center py-1 px-1 rounded bg-muted hover:bg-muted/80 transition-colors flex flex-col justify-between">
                        <p className="font-display text-lg text-green-500">{sellerActiveCount}</p>
                        <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Active</p>
                      </Link>
                      {sellerBidToCount > 0 ? (
                        <Link href={sellerTabLink("bidto", listing.managed_profile_id!, true)}
                          className="text-center py-1 px-1 rounded bg-muted hover:bg-muted/80 transition-colors flex flex-col justify-between">
                          <p className="font-display text-lg text-yellow-500">{sellerBidToCount}</p>
                          <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Bid To</p>
                        </Link>
                      ) : (
                        <div className="text-center py-1 px-1 rounded bg-muted flex flex-col justify-between">
                          <p className="font-display text-lg text-yellow-500">0</p>
                          <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Bid To</p>
                        </div>
                      )}
                      <Link href={sellerTabLink("sold", listing.managed_profile_id!, true)}
                        className="text-center py-1 px-1 rounded bg-muted hover:bg-muted/80 transition-colors flex flex-col justify-between">
                        <p className="font-display text-lg text-red-500">{sellerSoldCount}</p>
                        <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Sold</p>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href={sellerTabLink("active", listing.seller_id, false)}
                        className="text-center py-1 px-1 rounded bg-muted hover:bg-muted/80 transition-colors flex flex-col justify-between">
                        <p className="font-display text-lg text-green-500">{sellerActiveCount}</p>
                        <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Active</p>
                      </Link>
                      {sellerBidToCount > 0 ? (
                        <Link href={sellerTabLink("bidto", listing.seller_id, false)}
                          className="text-center py-1 px-1 rounded bg-muted hover:bg-muted/80 transition-colors flex flex-col justify-between">
                          <p className="font-display text-lg text-yellow-500">{sellerBidToCount}</p>
                          <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Bid To</p>
                        </Link>
                      ) : (
                        <div className="text-center py-1 px-1 rounded bg-muted flex flex-col justify-between">
                          <p className="font-display text-lg text-yellow-500">0</p>
                          <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Bid To</p>
                        </div>
                      )}
                      <Link href={sellerTabLink("sold", listing.seller_id, false)}
                        className="text-center py-1 px-1 rounded bg-muted hover:bg-muted/80 transition-colors flex flex-col justify-between">
                        <p className="font-display text-lg text-red-500">{sellerSoldCount}</p>
                        <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Sold</p>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Contact / Make Offer buttons */}
              {!isOwner && !isExternalListing && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                  <Button
                    onClick={() => setContactSellerOpen(true)}
                    className="flex-1 gap-2 btn-racing min-w-0"
                  >
                    {!userId ? (
                      <>
                        <LogIn className="w-4 h-4 shrink-0" />
                        <span className="truncate">Sign In to Contact</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 shrink-0" />
                        <span className="truncate">Contact Seller</span>
                      </>
                    )}
                  </Button>
                  {listing.negotiable && (
                    <Button
                      variant="outline"
                      onClick={() => setMakeOfferOpen(true)}
                      className="flex-1 gap-2 border-accent text-accent hover:bg-accent/10 min-w-0"
                    >
                      <DollarSign className="w-4 h-4 shrink-0" />
                      <span className="truncate">Make Offer</span>
                    </Button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
