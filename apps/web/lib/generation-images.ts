// Local fallback images for generation cards and filter thumbnails.
// These live in apps/web/public/generations/ and are web-only assets.
// packages/shared data still carries Unsplash URLs (used for OG metadata,
// React Native, and any context where a full URL is needed).

export const GENERATION_CARD_IMAGES: Record<string, string> = {
  c1: "/generations/c1.png",
  c2: "/generations/c2.png",
  c3: "/generations/c3.png",
  c4: "/generations/c4.png",
  c5: "/generations/c5.png",
  c6: "/generations/c6.png",
  c7: "/generations/c7.png",
  c8: "/generations/c8.png",
};

export const GENERATION_HISTORY_IMAGES: Record<string, string> = {
  c1: "/generations/history-c1.png",
  c2: "/generations/history-c2.png",
  c3: "/generations/history-c3.png",
  c4: "/generations/history-c4.png",
  c5: "/generations/history-c5.png",
  c6: "/generations/history-c6.png",
  c7: "/generations/history-c7.png",
  c8: "/generations/history-c8.png",
};
