export interface ListingImage {
  image_url: string;
  is_primary: boolean | null;
}

export interface ListingCardData {
  id: string;
  title: string;
  price: number;
  year: number;
  mileage: number | null;
  location_city: string | null;
  location_state: string | null;
  location_zip?: string | null;
  generation: string;
  is_sold?: boolean | null;
  status?: string;
  rejection_reason?: string | null;
  listing_type?: string | null;
  video_url?: string | null;
  stock_number?: number | null;
  vehicle_condition?: string | null;
  model?: string | null;
  used_type?: string | null;
  expiration_date?: string | null;
  is_external_listing?: boolean | null;
  external_image_url?: string | null;
  managed_profile_id?: string | null;
  seller_id?: string | null;
  negotiable?: boolean | null;
  listing_images?: ListingImage[] | null;
  is_dealer?: boolean | null;
  dealer_name?: string | null;
  is_auction?: boolean | null;
  is_bid_to?: boolean | null;
  managed_profiles?: { is_auction: boolean | null } | null;
}

export const LISTING_CARD_SELECT = `
  id,
  title,
  price,
  year,
  mileage,
  location_city,
  location_state,
  location_zip,
  generation,
  is_sold,
  is_bid_to,
  status,
  rejection_reason,
  listing_type,
  video_url,
  stock_number,
  vehicle_condition,
  model,
  used_type,
  expiration_date,
  is_external_listing,
  external_image_url,
  managed_profile_id,
  seller_id,
  is_dealer,
  dealer_name,
  negotiable,
  listing_images (
    image_url,
    is_primary
  ),
  managed_profiles!managed_profile_id (
    is_auction
  )
` as const;

export const LISTING_CARD_SELECT_MINIMAL = `
  id,
  title,
  price,
  year,
  mileage,
  location_city,
  location_state,
  location_zip,
  generation,
  is_sold,
  status,
  rejection_reason,
  listing_type,
  video_url,
  stock_number,
  vehicle_condition,
  model,
  used_type,
  expiration_date,
  views_count,
  created_at,
  listing_images (
    image_url,
    is_primary
  )
` as const;
