export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export const buildListingUrl = (
  stockNumber: number | null | undefined,
  year: number,
  generation: string,
  title: string
): string => {
  if (!stockNumber) {
    return `/listing/${year}-corvette-${generation.toLowerCase()}`;
  }
  const formattedStockNumber = stockNumber.toString().padStart(5, "0");
  const slug = generateSlug(title);
  return `/inventory/${formattedStockNumber}/${year}-corvette-${generation.toLowerCase()}-${slug}`;
};

export const buildEditListingUrl = (
  stockNumber: number | null | undefined,
  year: number,
  generation: string,
  title: string,
  queryParams?: string
): string => {
  const basePath = buildListingUrl(stockNumber, year, generation, title);
  return `${basePath}/edit${queryParams ?? ""}`;
};

export const parseStockNumber = (stockNumberParam: string): number | null => {
  const parsed = parseInt(stockNumberParam, 10);
  return isNaN(parsed) ? null : parsed;
};
