import type { ListingImage } from "../types/listing";

export interface ListingWithImages {
  listing_images?: ListingImage[] | null;
  is_external_listing?: boolean | null;
  external_image_url?: string | null;
}

export function getPrimaryImage(listing: ListingWithImages): string | null {
  const primary = listing.listing_images?.find((img) => img.is_primary);
  if (primary?.image_url) return primary.image_url;
  if (listing.listing_images?.[0]?.image_url) return listing.listing_images[0].image_url;
  if (listing.is_external_listing && listing.external_image_url) return listing.external_image_url;
  return null;
}

export function getPrimaryImageFromArray(
  images: ListingImage[] | undefined | null
): string | null {
  if (!images || images.length === 0) return null;
  const primary = images.find((img) => img.is_primary);
  return primary?.image_url || images[0]?.image_url || null;
}
