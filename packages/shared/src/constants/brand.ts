export const BRAND = {
  name: "Drop the Top",
  logoText: "DROP THE TOP",
  short: "DTT",
} as const;

export const TAGLINES = {
  primary: "The Corvette Marketplace",
  full: "The Corvette Marketplace",
  short: "The Corvette Marketplace",
} as const;

export const URLS = {
  website: "https://www.dropthetop.com",
  websiteShort: "dropthetop.com",
  email: {
    info: "info@dropthetop.com",
    contact: "contact@dropthetop.com",
    support: "support@dropthetop.com",
    legal: "legal@dropthetop.com",
    privacy: "privacy@dropthetop.com",
    noreply: "noreply@dropthetop.com",
  },
  phone: "1-800-CORVETTE",
} as const;

export const SOCIAL = {
  facebook: "https://www.facebook.com/people/dropthetopvettes/61575821855477/",
  instagram: "https://www.instagram.com/dropthetopvettes/",
  youtube: "https://www.youtube.com/channel/UCuwAeYKpz_fb_fIMrvCH2-Q",
  tiktok: "https://www.tiktok.com/@drop.the.top.vettes",
  x: "https://x.com/dropthetopvette",
} as const;

export const SEO = {
  title: (pageTitle?: string) =>
    pageTitle ? `${pageTitle} | ${BRAND.name}` : `${BRAND.name} | ${TAGLINES.short}`,
  titleWithTagline: (pageTitle: string) =>
    `${pageTitle} | ${BRAND.name} - ${TAGLINES.short}`,
} as const;

export const COPYRIGHT = {
  text: (year: number = new Date().getFullYear()) =>
    `© ${year} ${BRAND.name}. All rights reserved.`,
  year: new Date().getFullYear(),
} as const;

export const COMPANY = {
  foundedYear: 2024,
  foundedText: "Connecting Corvette enthusiasts since 2024.",
} as const;
