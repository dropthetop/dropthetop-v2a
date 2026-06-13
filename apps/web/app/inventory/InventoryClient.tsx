"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, LayoutGrid, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ListingCard } from "@/components/listings/ListingCard";
import { generations } from "@dropthetop/shared";
import { GENERATION_CARD_IMAGES } from "@/lib/generation-images";
import { GenerationGroupedView } from "@/components/inventory/GenerationGroupedView";
import type { ListingCardData } from "@dropthetop/shared";

export interface ParsedFilters {
  tab: "active" | "bid_to" | "sold";
  generation: string[];
  sort: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  maxMileage: string;
  bodyStyle: string;
  condition: string;
  usedType: string;
  transmission: string;
  sellerType: string;
  listingType: string;
  page: number;
  grouped: boolean;
}

interface InventoryClientProps {
  listings: ListingCardData[];
  total: number;
  pageSize: number;
  tabCounts: { active: number; bid_to: number; sold: number };
  generationCounts: Record<string, number>;
  userId: string | null;
  filters: ParsedFilters;
}

// ─── favorites hook ──────────────────────────────────────────────────────────

function useFavorites(userId: string | null) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (data) setFavorites(new Set(data.map((f) => f.listing_id)));
      });
  }, [userId]);

  const toggle = useCallback(
    async (listingId: string) => {
      if (!userId) return;
      const supabase = createClient();
      if (favorites.has(listingId)) {
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("listing_id", listingId);
      } else {
        setFavorites((prev) => new Set(prev).add(listingId));
        await supabase
          .from("favorites")
          .insert({ user_id: userId, listing_id: listingId });
      }
    },
    [userId, favorites]
  );

  return { isFavorite: (id: string) => favorites.has(id), toggle };
}

// ─── URL builder ─────────────────────────────────────────────────────────────

function buildParams(f: ParsedFilters): string {
  const p = new URLSearchParams();
  if (f.tab !== "active") p.set("tab", f.tab);
  if (f.generation.length) p.set("generation", f.generation.join(","));
  if (f.sort !== "newest") p.set("sort", f.sort);
  if (f.minPrice) p.set("minPrice", f.minPrice);
  if (f.maxPrice) p.set("maxPrice", f.maxPrice);
  if (f.minYear) p.set("minYear", f.minYear);
  if (f.maxYear) p.set("maxYear", f.maxYear);
  if (f.maxMileage) p.set("maxMileage", f.maxMileage);
  if (f.bodyStyle) p.set("bodyStyle", f.bodyStyle);
  if (f.condition) p.set("condition", f.condition);
  if (f.condition === "used" && f.usedType) p.set("usedType", f.usedType);
  if (f.transmission) p.set("transmission", f.transmission);
  if (f.sellerType) p.set("sellerType", f.sellerType);
  if (f.listingType) p.set("listingType", f.listingType);
  if (!f.grouped && f.page > 1) p.set("page", String(f.page));
  if (f.grouped) p.set("grouped", "true");
  return p.toString();
}

// ─── label maps (for reliable display without popup mounted) ─────────────────

const SORT_LABELS: Record<string, string> = {
  newest: "Newest First",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  year_desc: "Year: Newest",
  year_asc: "Year: Oldest",
  mileage_asc: "Mileage: Lowest",
};

const SELLER_TYPE_LABELS: Record<string, string> = {
  all: "All",
  dealer: "Dealer",
  private: "Private Owner",
};

const LISTING_TYPE_LABELS: Record<string, string> = {
  all: "All",
  internal: "DTT Original",
  external: "External Listing",
};

const BODY_STYLE_LABELS: Record<string, string> = {
  all: "All Body Styles",
  convertible: "Convertible",
  coupe: "Coupe",
};

const CONDITION_LABELS: Record<string, string> = {
  all: "All",
  new: "New",
  used: "Used",
};

const USED_TYPE_LABELS: Record<string, string> = {
  all: "All Used Types",
  body_off_restored: "Body Off Restored",
  daily_driver: "Daily Driver",
  light_restored: "Light Restored",
  project_car: "Project Car",
  restomod: "Restomod",
  survivor: "Survivor",
};

const TRANSMISSION_LABELS: Record<string, string> = {
  all: "All",
  automatic: "Automatic",
  manual: "Manual",
};

// ─── component ───────────────────────────────────────────────────────────────

export function InventoryClient({
  listings,
  total,
  pageSize,
  tabCounts,
  generationCounts,
  userId,
  filters,
}: InventoryClientProps) {
  const router = useRouter();
  const { isFavorite, toggle: toggleFavorite } = useFavorites(userId);

  const [showFilters, setShowFilters] = useState(false);

  // Local state for text inputs — applied on blur / Enter
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);
  const [minYear, setMinYear] = useState(filters.minYear);
  const [maxYear, setMaxYear] = useState(filters.maxYear);
  const [maxMileage, setMaxMileage] = useState(filters.maxMileage);

  // Sync local state when server-side filters change (back/forward nav)
  useEffect(() => {
    setMinPrice(filters.minPrice);
    setMaxPrice(filters.maxPrice);
    setMinYear(filters.minYear);
    setMaxYear(filters.maxYear);
    setMaxMileage(filters.maxMileage);
  }, [filters.minPrice, filters.maxPrice, filters.minYear, filters.maxYear, filters.maxMileage]);

  const push = useCallback(
    (override: Partial<ParsedFilters>, resetPage = true) => {
      const next: ParsedFilters = {
        ...filters,
        minPrice,
        maxPrice,
        minYear,
        maxYear,
        maxMileage,
        ...override,
        page: resetPage && !("page" in override) ? 1 : (override.page ?? filters.page),
      };
      const qs = buildParams(next);
      router.push(`/inventory${qs ? `?${qs}` : ""}`);
    },
    [filters, minPrice, maxPrice, minYear, maxYear, maxMileage, router]
  );

  const applyTextInputs = () => push({ minPrice, maxPrice, minYear, maxYear, maxMileage });

  const toggleGeneration = (genId: string) => {
    const current = filters.generation;
    const next = current.includes(genId)
      ? current.filter((g) => g !== genId)
      : [...current, genId];
    push({ generation: next });
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setMinYear("");
    setMaxYear("");
    setMaxMileage("");
    router.push("/inventory");
  };

  const hasActiveFilters =
    filters.generation.length > 0 ||
    filters.sort !== "newest" ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minYear ||
    filters.maxYear ||
    filters.maxMileage ||
    filters.bodyStyle ||
    filters.condition ||
    filters.transmission ||
    filters.sellerType ||
    filters.listingType;

  const totalPages = Math.ceil(total / pageSize);

  const tabConfig = [
    { value: "active" as const, label: "Active", count: tabCounts.active, activeClass: "data-[active=true]:border-green-500 data-[active=true]:text-green-500", ringColor: "border-green-600/30" },
    { value: "bid_to" as const, label: "Bid To", count: tabCounts.bid_to, activeClass: "data-[active=true]:border-yellow-400 data-[active=true]:text-yellow-400", ringColor: "border-yellow-500/30" },
    { value: "sold" as const, label: "Sold", count: tabCounts.sold, activeClass: "data-[active=true]:border-red-500 data-[active=true]:text-red-500", ringColor: "border-red-600/30" },
  ];

  // Build linkSuffix for back navigation from listing detail
  const currentSearch = buildParams(filters);
  const linkSuffix = currentSearch
    ? `?from=inventory&filters=${encodeURIComponent(currentSearch)}`
    : "?from=inventory";

  return (
    <main style={{ paddingTop: "calc(5rem + var(--safe-area-top, 0px))" }}>
      {/* Hero + Filter Bar */}
      <section className="pt-4 pb-10 md:pb-12 showroom-gradient border-b border-border">
        <div className="container mx-auto px-4">
          <p className="font-body text-accent uppercase tracking-[0.2em] text-sm mb-3">
            Browse Our Collection
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl mb-4">
            CORVETTE INVENTORY
          </h1>
          <p className="text-muted-foreground mb-6">
            Explore our curated selection of premium Corvettes. From classic C1s to the latest C8s,
            find your dream car today.
          </p>

          <div
            className="bg-background rounded-lg p-4 border-2 border-primary space-y-4"
            style={{ boxShadow: "0 0 20px hsl(215 85% 50% / 0.3)" }}
          >
            {/* Filter toggle row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center">
                      !
                    </span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground gap-1"
                >
                  <X className="w-4 h-4" />
                  Reset
                </Button>
                <Button
                  variant={filters.grouped ? "default" : "outline"}
                  size="sm"
                  onClick={() => push({ grouped: !filters.grouped, page: 1 }, false)}
                  className="gap-2"
                >
                  {filters.grouped ? (
                    <>
                      <LayoutGrid className="w-4 h-4" />
                      <span className="hidden sm:inline">Grid View</span>
                    </>
                  ) : (
                    <>
                      <Rows3 className="w-4 h-4" />
                      <span className="hidden sm:inline">View by Generation</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Sort */}
              <Select
                value={filters.sort}
                onValueChange={(v) => push({ sort: v ?? "newest" })}
              >
                <SelectTrigger className="w-auto min-w-40 bg-input border-border h-9">
                  <span className="flex-1 text-left text-sm truncate">
                    {SORT_LABELS[filters.sort] ?? "Newest First"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="year_desc">Year: Newest</SelectItem>
                  <SelectItem value="year_asc">Year: Oldest</SelectItem>
                  <SelectItem value="mileage_asc">Mileage: Lowest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generation Filter */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {generations.map((gen) => {
                const genId = gen.id.toLowerCase();
                const isSelected = filters.generation.includes(genId);
                const count = generationCounts[genId] ?? 0;
                return (
                  <button
                    key={gen.id}
                    onClick={() => toggleGeneration(genId)}
                    className="flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
                  >
                    <div
                      className={cn(
                        "relative w-[68px] h-12 md:w-[86px] md:h-[58px] rounded-lg overflow-hidden border-2 transition-all duration-300 bg-muted",
                        isSelected
                          ? "border-primary shadow-lg shadow-primary/30"
                          : "border-transparent hover:border-border"
                      )}
                    >
                      <img
                        src={GENERATION_CARD_IMAGES[gen.id.toLowerCase()] ?? gen.image}
                        alt={gen.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span
                      className={cn(
                        "mt-1.5 text-sm font-semibold uppercase tracking-wider transition-colors",
                        isSelected ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {gen.id.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">{gen.years}</span>
                    <span
                      className={cn(
                        "mt-1 text-[11px] font-semibold min-w-[24px] h-[18px] rounded-full flex items-center justify-center px-2 border text-foreground",
                        count > 0
                          ? "bg-primary/20 border-primary/30"
                          : "bg-muted/50 border-muted-foreground/20"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected generations display */}
            {filters.generation.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Selected:</span>
                {filters.generation.map((gen) => (
                  <span
                    key={gen}
                    className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-semibold uppercase"
                  >
                    {gen}
                  </span>
                ))}
              </div>
            )}

            {/* Expanded Filter Panel */}
            {showFilters && (
              <div className="pt-4 border-t border-border/50 animate-fade-in space-y-4">
                {/* Sort & Status */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-accent mb-3 font-medium">
                    Listing Type & Seller
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Seller Type</Label>
                      <Select value={filters.sellerType || "all"} onValueChange={(v) => push({ sellerType: v === "all" || !v ? "" : v })}>
                        <SelectTrigger className="w-full bg-input border-border h-9">
                          <span className="flex-1 text-left text-sm truncate">{SELLER_TYPE_LABELS[filters.sellerType || "all"]}</span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="dealer">Dealer</SelectItem>
                          <SelectItem value="private">Private Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Listing Type</Label>
                      <Select value={filters.listingType || "all"} onValueChange={(v) => push({ listingType: v === "all" || !v ? "" : v })}>
                        <SelectTrigger className="w-full bg-input border-border h-9">
                          <span className="flex-1 text-left text-sm truncate">{LISTING_TYPE_LABELS[filters.listingType || "all"]}</span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="internal">DTT Original</SelectItem>
                          <SelectItem value="external">External Listing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/30" />

                {/* Vehicle Details */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-accent mb-3 font-medium">
                    Vehicle Details
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Body Style</Label>
                      <Select value={filters.bodyStyle || "all"} onValueChange={(v) => push({ bodyStyle: v === "all" || !v ? "" : v })}>
                        <SelectTrigger className="w-full bg-input border-border h-9">
                          <span className="flex-1 text-left text-sm truncate">{BODY_STYLE_LABELS[filters.bodyStyle || "all"]}</span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Body Styles</SelectItem>
                          <SelectItem value="convertible">Convertible</SelectItem>
                          <SelectItem value="coupe">Coupe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Condition</Label>
                      <Select
                        value={filters.condition || "all"}
                        onValueChange={(v) => push({ condition: v === "all" || !v ? "" : v, usedType: "" })}
                      >
                        <SelectTrigger className="w-full bg-input border-border h-9">
                          <span className="flex-1 text-left text-sm truncate">{CONDITION_LABELS[filters.condition || "all"]}</span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="used">Used</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className={cn("text-xs uppercase tracking-wider", filters.condition !== "used" ? "text-muted-foreground/50" : "text-muted-foreground")}>
                        Used Type
                      </Label>
                      <Select
                        value={filters.usedType || "all"}
                        onValueChange={(v) => push({ usedType: v === "all" || !v ? "" : v })}
                        disabled={filters.condition !== "used"}
                      >
                        <SelectTrigger className={cn("w-full bg-input border-border h-9", filters.condition !== "used" && "opacity-50 cursor-not-allowed")}>
                          <span className="flex-1 text-left text-sm truncate">{USED_TYPE_LABELS[filters.usedType || "all"]}</span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Used Types</SelectItem>
                          <SelectItem value="body_off_restored">Body Off Restored</SelectItem>
                          <SelectItem value="daily_driver">Daily Driver</SelectItem>
                          <SelectItem value="light_restored">Light Restored</SelectItem>
                          <SelectItem value="project_car">Project Car</SelectItem>
                          <SelectItem value="restomod">Restomod</SelectItem>
                          <SelectItem value="survivor">Survivor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Transmission</Label>
                      <Select value={filters.transmission || "all"} onValueChange={(v) => push({ transmission: v === "all" || !v ? "" : v })}>
                        <SelectTrigger className="w-full bg-input border-border h-9">
                          <span className="flex-1 text-left text-sm truncate">{TRANSMISSION_LABELS[filters.transmission || "all"]}</span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="automatic">Automatic</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Max Mileage</Label>
                      <Input
                        type="number"
                        placeholder="No max"
                        value={maxMileage}
                        onChange={(e) => setMaxMileage(e.target.value)}
                        onBlur={applyTextInputs}
                        onKeyDown={(e) => e.key === "Enter" && applyTextInputs()}
                        className="bg-input border-border h-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/30" />

                {/* Price & Year */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-accent mb-3 font-medium">Price & Year</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Min Price</Label>
                      <Input
                        type="number"
                        placeholder="$0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        onBlur={applyTextInputs}
                        onKeyDown={(e) => e.key === "Enter" && applyTextInputs()}
                        className="bg-input border-border h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Max Price</Label>
                      <Input
                        type="number"
                        placeholder="No max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        onBlur={applyTextInputs}
                        onKeyDown={(e) => e.key === "Enter" && applyTextInputs()}
                        className="bg-input border-border h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Min Year</Label>
                      <Input
                        type="number"
                        placeholder="1953"
                        value={minYear}
                        onChange={(e) => setMinYear(e.target.value)}
                        onBlur={applyTextInputs}
                        onKeyDown={(e) => e.key === "Enter" && applyTextInputs()}
                        className="bg-input border-border h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Max Year</Label>
                      <Input
                        type="number"
                        placeholder="2025"
                        value={maxYear}
                        onChange={(e) => setMaxYear(e.target.value)}
                        onBlur={applyTextInputs}
                        onKeyDown={(e) => e.key === "Enter" && applyTextInputs()}
                        className="bg-input border-border h-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="pb-8 md:pb-10">
        <div className="container mx-auto px-4">
          {/* Status Tabs */}
          <div className="mb-6 mt-6">
            <div className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg gap-1">
              {tabConfig.map((tab) => (
                <button
                  key={tab.value}
                  data-active={filters.tab === tab.value}
                  onClick={() => push({ tab: tab.value })}
                  className={cn(
                    "bg-background border py-2.5 px-4 text-base font-medium rounded-md transition-all gap-2 flex items-center justify-center",
                    tab.ringColor,
                    filters.tab === tab.value
                      ? tab.activeClass.replace("data-[active=true]:", "") + " border-2 shadow-md"
                      : "hover:border-opacity-60"
                  )}
                >
                  {tab.label}
                  <span className="inline-flex items-center justify-center min-w-[2rem] h-7 px-2 text-base font-semibold rounded-full bg-current/10">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-muted-foreground mb-4">
            {total} vehicle{total !== 1 ? "s" : ""} found
            {!filters.grouped && totalPages > 1 && ` — page ${filters.page} of ${totalPages}`}
          </p>

          {/* Listings */}
          {listings.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-muted-foreground text-lg mb-4">
                No listings found matching your criteria.
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : filters.grouped ? (
            <GenerationGroupedView
              listings={listings}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
              userId={userId}
              linkSuffix={linkSuffix}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  <ListingCard
                    key={listing.id}
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
                );
              })}
            </div>
          )}

          {/* Pagination — hidden in grouped mode */}
          {!filters.grouped && totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <Button
                variant="outline"
                onClick={() => push({ page: filters.page - 1 }, false)}
                disabled={filters.page <= 1}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {filters.page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => push({ page: filters.page + 1 }, false)}
                disabled={filters.page >= totalPages}
                className="gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
