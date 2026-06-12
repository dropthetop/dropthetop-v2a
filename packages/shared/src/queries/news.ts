import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import type { NewsArticle } from "../types/news";

export interface NewsFilters {
  generation?: string | null;
  limit?: number;
  featured?: boolean;
  includeInactive?: boolean;
}

export async function getNewsArticles(
  client: SupabaseClient<Database>,
  filters: NewsFilters = {}
): Promise<NewsArticle[]> {
  const { generation, limit = 100, featured, includeInactive = false } = filters;

  let query = client
    .from("news_articles")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (!includeInactive) query = (query as any).eq("is_active", true);
  if (generation) query = (query as any).eq("generation", generation);
  if (featured !== undefined) query = (query as any).eq("is_featured", featured);
  if (limit) query = (query as any).limit(limit);

  const { data, error } = await (query as any);
  if (error) throw error;
  return (data ?? []) as NewsArticle[];
}

export async function getFeaturedNewsArticles(
  client: SupabaseClient<Database>,
  limit = 3
): Promise<NewsArticle[]> {
  const { data, error } = await client
    .from("news_articles")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as NewsArticle[];
}
