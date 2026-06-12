export interface NewsArticle {
  id: string;
  source_url: string;
  source_name: string;
  title: string;
  summary: string | null;
  image_url: string | null;
  published_at: string | null;
  scraped_at: string;
  generation: string | null;
  tags: string[] | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  scrape_pattern: string | null;
  is_active: boolean;
  last_scraped_at: string | null;
  scrape_frequency_hours: number;
  created_at: string;
  updated_at: string;
}

export type NewsCardVariant = "card" | "list" | "hero";

export interface NewsCardProps {
  article: NewsArticle;
  variant?: NewsCardVariant;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  onArticleClick?: (id: string) => void;
  showFeaturedBadge?: boolean;
  showTags?: boolean;
}

export const GENERATION_LABELS: Record<string, string> = {
  c1: "C1 (1953-1962)",
  c2: "C2 (1963-1967)",
  c3: "C3 (1968-1982)",
  c4: "C4 (1984-1996)",
  c5: "C5 (1997-2004)",
  c6: "C6 (2005-2013)",
  c7: "C7 (2014-2019)",
  c8: "C8 (2020+)",
};

export const GENERATION_LABELS_SHORT: Record<string, string> = {
  c1: "C1",
  c2: "C2",
  c3: "C3",
  c4: "C4",
  c5: "C5",
  c6: "C6",
  c7: "C7",
  c8: "C8",
};

export function calculateReadingTime(article: NewsArticle, shortFormat = false): string {
  const text = (article.title || "") + " " + (article.summary || "");
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return shortFormat ? `${minutes} min` : `${minutes} min read`;
}
