import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BRAND } from "@dropthetop/shared";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: `My Dashboard | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth?redirect=/dashboard");

  // ── profile ───────────────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, is_dealer")
    .eq("id", user.id)
    .maybeSingle();

  // ── my listings ───────────────────────────────────────────────────────────
  const { data: myListings } = await supabase
    .from("listings")
    .select(
      "id, title, price, year, generation, stock_number, status, is_sold, is_bid_to, rejection_reason, expiration_date, created_at, listing_images(image_url, is_primary, display_order)"
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  // ── favorites ─────────────────────────────────────────────────────────────
  const { data: favRows } = await supabase
    .from("favorites")
    .select(
      "id, listing_id, listings(id, title, price, year, generation, stock_number, is_sold, listing_images(image_url, is_primary, display_order))"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // ── offers received ───────────────────────────────────────────────────────
  // Get my listing IDs first
  const myListingIds = (myListings ?? []).map((l) => l.id);

  const { data: offersReceived } =
    myListingIds.length > 0
      ? await supabase
          .from("offers")
          .select(
            "id, amount, status, message, created_at, buyer_id, listing_id, listings(id, title, year)"
          )
          .in("listing_id", myListingIds)
          .order("created_at", { ascending: false })
          .limit(50)
      : { data: [] };

  // ── my offers (sent) ──────────────────────────────────────────────────────
  const { data: myOffers } = await supabase
    .from("offers")
    .select(
      "id, amount, status, message, rejection_reason, approval_message, created_at, listing_id, listings(id, title, year, price, seller_id, listing_images(image_url, is_primary, display_order))"
    )
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // ── messages ──────────────────────────────────────────────────────────────
  const { data: messages } = await supabase
    .from("messages")
    .select(
      "id, content, created_at, read_at, sender_id, recipient_id, listing_id, listings(id, title, listing_images(image_url, is_primary, display_order))"
    )
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(50);

  // ── batch profile lookup ───────────────────────────────────────────────────
  // Collect all unique profile IDs needed across offers and messages in one query
  const allProfileIds = new Set<string>();
  (offersReceived ?? []).forEach((o) => { if (o.buyer_id) allProfileIds.add(o.buyer_id); });
  (myOffers ?? []).forEach((o) => { if ((o.listings as any)?.seller_id) allProfileIds.add((o.listings as any).seller_id); });
  (messages ?? []).forEach((m) => {
    if (m.sender_id) allProfileIds.add(m.sender_id);
    if (m.recipient_id) allProfileIds.add(m.recipient_id);
  });

  let profileMap: Record<string, { first_name: string | null; last_name: string | null }> = {};
  if (allProfileIds.size > 0) {
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", [...allProfileIds]);
    profileMap = Object.fromEntries((profileRows ?? []).map((p) => [p.id, p]));
  }

  const offersReceivedEnriched = (offersReceived ?? []).map((o) => ({
    ...o,
    buyer_profile: o.buyer_id ? (profileMap[o.buyer_id] ?? null) : null,
  }));

  const myOffersEnriched = (myOffers ?? []).map((o) => ({
    ...o,
    seller_profile: (o.listings as any)?.seller_id ? (profileMap[(o.listings as any).seller_id] ?? null) : null,
  }));

  const messagesEnriched = (messages ?? []).map((m) => ({
    ...m,
    sender_profile: m.sender_id ? (profileMap[m.sender_id] ?? null) : null,
    recipient_profile: m.recipient_id ? (profileMap[m.recipient_id] ?? null) : null,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DashboardClient
        userId={user.id}
        profile={profile ?? null}
        myListings={(myListings ?? []) as any[]}
        favorites={(favRows ?? []) as any[]}
        offersReceived={offersReceivedEnriched as any[]}
        myOffers={myOffersEnriched as any[]}
        messages={messagesEnriched as any[]}
      />
      <Footer />
    </div>
  );
}
