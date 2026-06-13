import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BRAND } from "@dropthetop/shared";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ProfileClient } from "./ProfileClient";

export const metadata: Metadata = {
  title: `My Profile | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth?redirect=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "first_name, last_name, dealer_name, phone, address, location_city, location_state, zip_code, website, bio, contact_email, is_dealer, created_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ProfileClient
        userId={user.id}
        userEmail={user.email ?? ""}
        isVerified={!!user.email_confirmed_at}
        profile={profile ?? null}
      />
      <Footer />
    </div>
  );
}
