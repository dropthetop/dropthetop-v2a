import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { BRAND } from "@dropthetop/shared";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CreateListingClient } from "./CreateListingClient";
import type { ListingLookups } from "@/lib/listing-form";

export const metadata: Metadata = {
  title: `Create Listing | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export default async function NewListingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth?redirect=/dashboard/listings/new");

  // Fetch all lookup tables in parallel
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
      <CreateListingClient userId={user.id} lookups={lookups} />
      <Footer />
    </div>
  );
}
