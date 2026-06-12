"use client";

import { Calendar, Clock, ExternalLink, Bookmark, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@dropthetop/shared";
import { GENERATION_LABELS, GENERATION_LABELS_SHORT, calculateReadingTime } from "@dropthetop/shared";
import type { NewsArticle } from "@dropthetop/shared";

// ─── shared image ─────────────────────────────────────────────────────────────

function NewsImage({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn("w-full h-full object-cover", className)}
        loading="lazy"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
      <span className="font-display text-4xl text-primary/30">DTT</span>
    </div>
  );
}

// ─── card variant ─────────────────────────────────────────────────────────────

interface CardProps {
  article: NewsArticle;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
}

export function NewsCard({ article, isBookmarked, onToggleBookmark }: CardProps) {
  const published = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : null;
  const readTime = calculateReadingTime(article);

  return (
    <div className="group overflow-hidden rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
      <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <NewsImage
            src={article.image_url}
            alt={article.title}
            className="group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs">
              {article.source_name}
            </Badge>
          </div>
          {article.is_featured && (
            <div className="absolute top-3 right-12">
              <Badge className="bg-primary text-primary-foreground text-xs">Featured</Badge>
            </div>
          )}
          {onToggleBookmark && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleBookmark(article.id); }}
            >
              <Bookmark className={cn("h-4 w-4 transition-colors", isBookmarked ? "fill-primary text-primary" : "text-muted-foreground")} />
            </Button>
          )}
        </div>

        <div className="p-4 space-y-3">
          <h3 className="font-display text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-sm text-muted-foreground line-clamp-3">{article.summary}</p>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {published && (
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{published}</span>
              )}
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime}</span>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          {(article.generation || (article.tags && article.tags.length > 0)) && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {article.generation && (
                <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20">
                  {GENERATION_LABELS[article.generation] ?? article.generation.toUpperCase()}
                </Badge>
              )}
              {article.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="w-2.5 h-2.5 mr-1" />{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </a>
    </div>
  );
}

// ─── list variant ─────────────────────────────────────────────────────────────

export function NewsListItem({ article, isBookmarked, onToggleBookmark }: CardProps) {
  const published = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : null;
  const readTime = calculateReadingTime(article, true);

  return (
    <a
      href={article.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 p-3 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md hover:border-border transition-all duration-200"
    >
      <div className="relative w-24 h-16 md:w-32 md:h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
        <NewsImage
          src={article.image_url}
          alt={article.title}
          className="group-hover:scale-105 transition-transform duration-300"
        />
        {article.is_featured && (
          <div className="absolute top-1 right-1">
            <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">Featured</Badge>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-base md:text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            {onToggleBookmark && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleBookmark(article.id); }}
              >
                <Bookmark className={cn("h-3.5 w-3.5 transition-colors", isBookmarked ? "fill-primary text-primary" : "text-muted-foreground")} />
              </Button>
            )}
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
        {article.summary && (
          <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-[10px] md:text-xs px-1.5 py-0">{article.source_name}</Badge>
          {article.generation && (
            <Badge variant="outline" className="text-[10px] md:text-xs px-1.5 py-0 bg-primary/5 border-primary/20">
              {GENERATION_LABELS_SHORT[article.generation] ?? article.generation.toUpperCase()}
            </Badge>
          )}
          <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground">
            {published && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{published}</span>}
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

// ─── hero variant (featured section) ─────────────────────────────────────────

export function NewsHeroCard({ article }: { article: NewsArticle }) {
  const published = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : null;

  return (
    <a
      href={article.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block rounded-xl overflow-hidden aspect-[4/3]"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
      {article.image_url ? (
        <img
          src={article.image_url}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
      )}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
        <Badge className="mb-3 bg-primary text-primary-foreground">Featured</Badge>
        <h3 className="font-display text-xl md:text-2xl leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.summary && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.summary}</p>
        )}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{article.source_name}</span>
          {published && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{published}</span>}
          <ExternalLink className="w-4 h-4 ml-auto group-hover:text-primary transition-colors" />
        </div>
      </div>
    </a>
  );
}
