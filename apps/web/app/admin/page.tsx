import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ManageListingsClient } from "./ManageListingsClient";

export const metadata: Metadata = {
  title: "Manage Listings | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const supabase = await createClient();

  const [{ data: listings }, { count: viewsCount }] = await Promise.all([
    supabase
      .from("listings")
      .select(`
        id, title, price, year, generation, status, featured, created_at, views_count,
        seller_id, start_date, expiration_date, listing_type, is_sold, is_bid_to,
        stock_number, vin, model, managed_profile_id,
        profiles:seller_id (first_name, last_name, is_active),
        managed_profiles:managed_profile_id (first_name, last_name, dealer_name, is_dealer),
        listing_images (image_url, is_primary)
      `)
      .order("stock_number", { ascending: false }),
    supabase.from("listing_views").select("id", { count: "exact", head: true }),
  ]);

  return (
    <ManageListingsClient
      initialListings={(listings ?? []) as any[]}
      initialViewsCount={viewsCount ?? 0}
    />
  );
}
