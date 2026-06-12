import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

export async function getGenerationImages(
  client: SupabaseClient<Database>,
  generationId: string
) {
  const { data, error } = await client
    .from("generation_images")
    .select("*")
    .eq("generation_id", generationId)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getLookupTable(
  client: SupabaseClient<Database>,
  table: "generations" | "transmissions" | "body_styles" | "vehicle_conditions" | "used_types" | "conditions" | "listing_types"
) {
  const { data, error } = await (client.from(table as any) as any)
    .select("*")
    .order("display_order", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data ?? [];
}

export async function getPublicProfile(
  client: SupabaseClient<Database>,
  profileId: string
) {
  const { data, error } = await client
    .rpc("get_public_profile", { profile_id: profileId });

  if (error) throw error;
  return data;
}
