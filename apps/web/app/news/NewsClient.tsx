"use client";

import { useState, useMemo, useEffect } from "react";
import { Newspaper, Search, X, Bookmark, LayoutGrid, List, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NewsCard, NewsListItem, NewsHeroCard } from "@/components/news/NewsCard";
import type { NewsArticle } from "@dropthetop/shared";

type SortOption = "newest" | "oldest" | "featured";
type ViewMode = "grid" | "list";

const GENERATION_FILTERS = [
  { value: "c8", label: "C8", years: "2020+" },
  { value: "c7", label: "C7", years: "2014–2019" },
  { value: "c6", label: "C6", years: "2005–2013" },
  { value: "c5", label: "C5", years: "1997–2004" },
  { value: "c4", label: "C4", years: "1984–1996" },
  { value: "c3", label: "C3", years: "1968–1982" },
  { value: "c2", label: "C2", years: "1963–1967" },
  { value: "c1", label: "C1", years: "1953–1962" },
  { value: "general", label: "General", years: null },
];

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest First",
  oldest: "Oldest First",
  featured: "Featured First",
};

// ─── bookmarks (localStorage) ─────────────────────────────────────────────────

function useNewsBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("news-bookmarks");
      if (saved) setBookmarks(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem("news-bookmarks", JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  return { bookmarks, toggleBookmark };
}

// ─── component ────────────────────────────────────────────────────────────────

interface NewsClientProps {
  featured: NewsArticle[];
  articles: NewsArticle[];
}

export function NewsClient({ featured, articles }: NewsClientProps) {
  const [generation, setGeneration] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const { bookmarks, toggleBookmark } = useNewsBookmarks();

  // Restore view mode preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("news-view-mode") as ViewMode | null;
      if (saved === "grid" || saved === "list") setViewMode(saved);
    } catch {}
  }, []);

  const saveViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    try { localStorage.setItem("news-view-mode", mode); } catch {}
  };

  // Generation article counts (from full unfiltered set)
  const generationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach((a) => {
      const key = a.generation ?? "general";
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return counts;
  }, [articles]);

  // Filtered + sorted articles
  const filtered = useMemo(() => {
    let result = articles;

    if (generation) {
      result = generation === "general"
        ? result.filter((a) => !a.generation)
        : result.filter((a) => a.generation === generation);
    }

    if (showBookmarksOnly) {
      result = result.filter((a) => bookmarks.has(a.id));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.summary && a.summary.toLowerCase().includes(q))
      );
    }

    return [...result].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.published_at ?? a.created_at).getTime() -
               new Date(b.published_at ?? b.created_at).getTime();
      }
      if (sortBy === "featured") {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
      }
      return new Date(b.published_at ?? b.created_at).getTime() -
             new Date(a.published_at ?? a.created_at).getTime();
    });
  }, [articles, generation, showBookmarksOnly, search, sortBy, bookmarks]);

  const handleGenerationChange = (val: string | null) => {
    setGeneration((prev) => (prev === val ? null : val));
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Page header */}
      <div style={{ height: "calc(4rem + var(--safe-area-top, 0px))" }} />
      <section className="relative py-14 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="w-8 h-8 text-primary" />
            <h1 className="font-display text-4xl md:text-5xl">Corvette News</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Stay informed with the latest Corvette news, reviews, and announcements from top automotive sources.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">

        {/* Featured section */}
        {featured.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-display text-2xl">Featured Stories</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((a) => <NewsHeroCard key={a.id} article={a} />)}
            </div>
          </section>
        )}

        {/* Search + controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearch("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-44"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <option key={key} value={key}>{SORT_LABELS[key]}</option>
            ))}
          </select>

          {/* View mode */}
          <div className="flex items-center border border-input rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="h-10 w-10 rounded-r-none"
              onClick={() => saveViewMode("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="h-10 w-10 rounded-l-none border-l border-input"
              onClick={() => saveViewMode("list")}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Bookmarks toggle */}
          <Button
            variant={showBookmarksOnly ? "default" : "outline"}
            size="sm"
            className="h-10 gap-2"
            onClick={() => setShowBookmarksOnly((p) => !p)}
          >
            <Bookmark className={showBookmarksOnly ? "h-4 w-4 fill-current" : "h-4 w-4"} />
            <span className="hidden sm:inline">Saved</span>
            {bookmarks.size > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">{bookmarks.size}</Badge>
            )}
          </Button>
        </div>

        {/* Generation filter badges */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-sm text-muted-foreground mr-1">Filter:</span>
          {generation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGeneration(null)}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
          <div className="flex flex-wrap gap-2">
            {GENERATION_FILTERS.map((g) => {
              const count = generationCounts[g.value];
              return (
                <Badge
                  key={g.value}
                  variant={generation === g.value ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    generation === g.value
                      ? "bg-primary text-primary-foreground"
                      : "border-2 border-border hover:bg-primary/10 hover:border-primary/50"
                  }`}
                  onClick={() => handleGenerationChange(g.value)}
                >
                  {g.label}
                  {g.years && <span className="ml-1 text-xs opacity-70">({g.years})</span>}
                  {count !== undefined && count > 0 && (
                    <span className="ml-1.5 text-xs bg-background/20 px-1.5 py-0.5 rounded-full">{count}</span>
                  )}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Article list */}
        {filtered.length > 0 ? (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((a) => (
                  <NewsCard
                    key={a.id}
                    article={a}
                    isBookmarked={bookmarks.has(a.id)}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((a) => (
                  <NewsListItem
                    key={a.id}
                    article={a}
                    isBookmarked={bookmarks.has(a.id)}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </div>
            )}
            <p className="text-center text-sm text-muted-foreground mt-8">
              Showing {filtered.length} article{filtered.length !== 1 ? "s" : ""}
            </p>
          </>
        ) : (
          <div className="text-center py-16">
            <Newspaper className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display text-xl mb-2">No Articles Found</h3>
            <p className="text-muted-foreground">
              {showBookmarksOnly
                ? "You haven't saved any articles yet. Click the bookmark icon on any article to save it."
                : search
                ? `No articles match "${search}".`
                : generation
                ? `No news articles found for ${generation.toUpperCase()} Corvettes.`
                : "News articles will appear here once available."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
