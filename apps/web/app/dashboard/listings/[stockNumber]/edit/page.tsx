import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { BRAND, parseStockNumber } from "@dropthetop/shared";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { EditListingClient } from "./EditListingClient";
import type { ListingLookups } from "@/lib/listing-form";

export const metadata: Metadata = {
  title: `Edit Listing | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ stockNumber: string }>;
}) {
  const { stockNumber: rawParam } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/auth?redirect=/dashboard`);

  const stockNum = parseStockNumber(rawParam);
  if (!stockNum) notFound();

  // Fetch listing — seller must own it
  const { data: listing } = await supabase
    .from("listings")
    .select(
      "*, listing_images(id, image_url, is_primary, display_order)"
    )
    .eq("stock_number", stockNum)
    .eq("seller_id", user.id)
    .maybeSingle();

  if (!listing) notFound();

  // Fetch lookup tables in parallel
  const [transRes, condRes, vcRes, utRes, bsRes] = await Promise.all([
    supabase.from("transmissions").select("id, display_name").order("display_order"),
    supabase.from("conditions").select("id, display_name").order("display_order"),
    supabase.from("vehicle_conditions").select("id, display_name").order("display_order"),
    supabase.from("used_types").select("id, display_name").order("display_order"),
    supabase.from("body_styles").select("id, display_name").order("display_order"),
  ]);

  const lookups: ListingLookups = {
    transmissions: transRes.data ?? [],
    conditions: condRes.data ?? [],
    vehicle_conditions: vcRes.data ?? [],
    used_types: utRes.data ?? [],
    body_styles: bsRes.data ?? [],
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EditListingClient userId={user.id} listing={listing as any} lookups={lookups} />
      <Footer />
    </div>
  );
}
