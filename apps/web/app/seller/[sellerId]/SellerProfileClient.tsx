"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Building2, ExternalLink, Gavel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/listings/ListingCard";

export interface ProfileListing {
  id: string;
  title: string;
  price: number;
  year: number;
  mileage: number | null;
  location_city: string | null;
  location_state: string | null;
  generation: string;
  stock_number: number | null;
  is_sold: boolean | null;
  is_bid_to: boolean | null;
  vehicle_condition: string | null;
  listing_type: string | null;
  video_url: string | null;
  is_external_listing: boolean | null;
  seller_id: string | null;
  managed_profile_id: string | null;
  negotiable: boolean | null;
  used_type: string | null;
  is_auction: boolean | null;
  image_url: string | null;
}

export interface ProfileData {
  name: string;
  isDealer: boolean;
  isAuction?: boolean;
  avatarUrl: string | null;
  location: string | null;
  website: string | null;
  memberSince: string | null;
}

type TabKey = "active" | "bidto" | "sold";

interface Props {
  profile: ProfileData;
  activeListings: ProfileListing[];
  bidToListings: ProfileListing[];
  soldListings: ProfileListing[];
  backHref: string;
  backLabel: string;
  linkSuffix: string;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function SellerProfileClient({
  profile,
  activeListings,
  bidToListings,
  soldListings,
  backHref,
  backLabel,
  linkSuffix,
}: Props) {
  const [tab, setTab] = useState<TabKey>("active");

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "active", label: "Active", count: activeListings.length },
    ...(bidToListings.length > 0
      ? [{ key: "bidto" as TabKey, label: "Bid To", count: bidToListings.length }]
      : []),
    { key: "sold", label: "Sold", count: soldListings.length },
  ];

  const currentListings =
    tab === "active"
      ? activeListings
      : tab === "bidto"
        ? bidToListings
        : soldListings;

  return (
    <main style={{ paddingTop: "calc(5rem + var(--safe-area-top, 0px))" }}>
      <div className="container mx-auto px-4 py-2 max-w-5xl">
        <Link
          href={backHref}
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {backLabel}
        </Link>

        {/* Profile header */}
        <div className="glass-card rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : profile.isDealer ? (
                <Building2 className="w-8 h-8 text-muted-foreground" />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display text-2xl md:text-3xl truncate">{profile.name}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge
                  variant={profile.isDealer ? "default" : "outline"}
                  className={
                    profile.isDealer
                      ? "bg-accent/20 text-accent border-accent/30 text-xs"
                      : "border-2 border-muted-foreground/50 text-xs"
                  }
                >
                  {profile.isDealer ? "Dealer" : "Private Owner"}
                </Badge>
                {profile.isAuction && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-amber-500/50 text-amber-600 dark:text-amber-400 text-xs"
                  >
                    <Gavel className="w-3 h-3" />
                    Auction
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.location && <span>{profile.location}</span>}
                {profile.memberSince && (
                  <span>Member since {formatDate(profile.memberSince)}</span>
                )}
                {profile.website && (
                  <a
                    href={
                      profile.website.startsWith("http")
                        ? profile.website
                        : `https://${profile.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t.label}{" "}
              <span
                className={`ml-1 text-xs ${tab === t.key ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}
              >
                ({t.count})
              </span>
            </button>
          ))}
        </div>

        {/* Listings grid */}
        {currentListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {currentListings.map((listing) => (
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
                image_url={listing.image_url}
                stock_number={listing.stock_number}
                is_sold={listing.is_sold}
                is_bid_to={listing.is_bid_to}
                vehicle_condition={listing.vehicle_condition}
                listing_type={listing.listing_type}
                video_url={listing.video_url}
                is_external_listing={listing.is_external_listing}
                seller_id={listing.seller_id}
                managed_profile_id={listing.managed_profile_id}
                negotiable={listing.negotiable}
                used_type={listing.used_type}
                is_auction={listing.is_auction}
                linkSuffix={linkSuffix}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            No{" "}
            {tab === "active" ? "active" : tab === "bidto" ? "bid-to" : "sold"}{" "}
            listings.
          </div>
        )}
      </div>
    </main>
  );
}
