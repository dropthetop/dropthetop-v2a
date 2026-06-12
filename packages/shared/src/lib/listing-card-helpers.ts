import { getPrimaryImage } from "./listing-image";
import type { ListingCardData } from "../types/listing";

interface DealerInfo {
  is_dealer: boolean | null;
  dealer_name: string | null;
}

export async function enrichListingsWithDealerInfo<
  T extends {
    seller_id?: string | null;
    managed_profile_id?: string | null;
    is_external_listing?: boolean | null;
    is_dealer?: boolean | null;
    dealer_name?: string | null;
  }
>(listings: T[]): Promise<(T & DealerInfo)[]> {
  return listings.map((listing) => ({
    ...listing,
    is_dealer: listing.is_dealer ?? null,
    dealer_name: listing.dealer_name ?? null,
  }));
}

export function mapToListingCardProps(listing: ListingCardData) {
  return {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    year: listing.year,
    mileage: listing.mileage,
    location_city: listing.location_city,
    location_state: listing.location_state,
    location_zip: listing.location_zip,
    generation: listing.generation,
    image_url: getPrimaryImage(listing),
    is_sold: listing.is_sold || false,
    status: listing.status,
    rejection_reason: listing.rejection_reason,
    listing_type: listing.listing_type,
    video_url: listing.video_url,
    stock_number: listing.stock_number,
    vehicle_condition: listing.vehicle_condition,
    model: listing.model,
    used_type: listing.used_type,
    expiration_date: listing.expiration_date,
    is_external_listing: listing.is_external_listing,
    dealer_name: listing.dealer_name,
    managed_profile_id: listing.managed_profile_id,
    seller_id: listing.seller_id,
    is_dealer: listing.is_dealer,
    is_auction: listing.managed_profiles?.is_auction ?? listing.is_auction ?? false,
    negotiable: listing.negotiable ?? false,
    is_bid_to: listing.is_bid_to ?? false,
  };
}
