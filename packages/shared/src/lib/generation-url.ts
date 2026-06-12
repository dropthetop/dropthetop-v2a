import { generations, getGenerationById } from "../data/generations";
import { URLS } from "../constants/brand";

export function buildGenerationUrl(generationId: string): string {
  const gen = getGenerationById(generationId);
  if (!gen) return `/history/${generationId}`;
  const yearsSlug = gen.years.replace(/\s/g, "").toLowerCase();
  return `/history/${gen.id.toLowerCase()}-corvette-${yearsSlug}`;
}

export function parseGenerationIdFromSlug(slug: string): string {
  if (/^c[1-8]$/i.test(slug)) return slug.toLowerCase();
  const match = slug.match(/^(c[1-8])-/i);
  if (match) return match[1].toLowerCase();
  return slug.toLowerCase();
}

export function getGenerationCanonicalUrl(generationId: string): string {
  return `${URLS.website}${buildGenerationUrl(generationId)}`;
}

export { generations, getGenerationById };
