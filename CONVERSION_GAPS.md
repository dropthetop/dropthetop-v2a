# Conversion Gaps

Features and behaviors v1 had that v2a does not yet implement.

---

## Must-fix before conversion complete

Open FIX-BEFORE-DONE items only. Remove from this list when moved to Completed.

- [ ] **Sitemap generation** — SEO & Growth
- [ ] **GA4 event tracking** — Analytics
- [ ] **Listing view tracking** — Analytics *(new)*
- [ ] **Cookie consent banner** — Privacy & Consent *(new)*
- [ ] **Seller per-listing view analytics** — Dashboard
- [ ] **My Listings status filter** — Dashboard *(new)*
- [ ] **Listing expiry automation** — Admin
- [ ] **Year Sales pricing** — Admin
- [ ] **Scroll & state restoration** — UX / Navigation

---

## SEO & Growth

- **Sitemap generation**
  - v1 page/feature: `public/robots.txt` → Supabase edge function `generate-sitemap`
  - Gap: v2a blocks all crawlers with no sitemap reference; the edge function exists but is not exposed or wired
  - Category: Re-implement
  - Disposition: FIX-BEFORE-DONE

## Analytics

- **GA4 event tracking**
  - v1 page/feature: `src/lib/analytics.ts`, called from Auth, ListingDetail, Dashboard, and other pages
  - Gap: v2a has no GA4 instrumentation; page_view, view_item, generate_lead, add_to_cart, sign_up, login, and password_reset events are all missing
  - Category: Re-implement
  - Disposition: FIX-BEFORE-DONE

- **[NEW] Listing view tracking**
  - v1 page/feature: `src/hooks/use-listing-views.ts` → `trackListingView` called on ListingDetail mount
  - Gap: v2a's listing detail page never calls any edge function when a listing is visited; the `listing_views` table never populates, making seller view analytics and all admin analytics permanently empty
  - Category: Oversight
  - Disposition: FIX-BEFORE-DONE

- **[NEW] News article view tracking**
  - v1 page/feature: `src/hooks/use-news-views.ts`, called when a news article is opened
  - Gap: v2a never writes to the `news_article_views` table; article view counts are always zero
  - Category: Oversight
  - Disposition: DEFER-POST-LAUNCH

- **Anonymous session + fingerprint analytics**
  - v1 page/feature: `src/hooks/use-fingerprint-analytics.ts`, `src/components/admin/FingerprintTrackingAnalytics.tsx`
  - Gap: v1 tracked non-authenticated visitors via browser fingerprint + session ID and surfaced deduplication stats in admin; v2a does not track anonymous sessions at all
  - Category: Oversight
  - Disposition: DEFER-POST-LAUNCH

## Privacy & Consent

- **[NEW] Cookie consent banner**
  - v1 page/feature: `src/components/CookieConsent.tsx`, `src/hooks/use-cookie-consent.ts`
  - Gap: v1 showed a glass-card banner at page bottom with Accept/Decline; GA4 was gated behind acceptance (never loaded until user accepted); persistence in localStorage; v2a has no cookie consent layer at all
  - Category: Oversight
  - Disposition: FIX-BEFORE-DONE

## External Link Tracking

- **[NEW] External link tracking system**
  - v1 page/feature: `src/hooks/use-external-link-tracking.ts`, `track-external-click` edge function, called from ListingDetail and Auth
  - Gap: v1 generated a session ID, recorded every click to an external listing (dealer, listing ID, user auth status), tracked whether the user skipped or signed up, and completed signup tracking (user ID + email) on registration; v2a has none of this conversion funnel tracking
  - Category: Oversight
  - Disposition: DEFER-POST-LAUNCH

- **[NEW] External listing signup prompt**
  - v1 page/feature: `src/pages/ListingDetail.tsx` — dialog shown to unauthenticated users before leaving for an external listing URL
  - Gap: v1 intercepted the external link click for non-authenticated users and showed a benefits modal (save favorites, alerts, community) with a sign-up CTA; v2a shows a direct link with no interstitial
  - Category: Oversight
  - Disposition: DEFER-POST-LAUNCH

## Dashboard

- **Seller per-listing view analytics**
  - v1 page/feature: `src/components/dashboard/ListingViewsAnalytics.tsx`, used in Dashboard seller listings tab
  - Gap: v1 showed sellers an Eye button per listing that opened a dialog with total/member/guest view counts and a timestamped activity log; v2a shows no view stats to sellers
  - Category: Oversight
  - Disposition: FIX-BEFORE-DONE

- **Real-time listing view counts**
  - v1 page/feature: `src/hooks/use-listing-views.ts`, `listing_views` table
  - Gap: view data (total, member, guest counts) is tracked but not surfaced on the public listing detail page
  - Category: Oversight
  - Disposition: DEFER-POST-LAUNCH

- **[NEW] My Listings status filter**
  - v1 page/feature: `src/pages/Dashboard.tsx` — status dropdown on the My Listings tab
  - Gap: v1 let sellers filter their listings by status (all, approved, pending, active, sold, expired, rejected, bid_to); v2a shows all listings in a flat unfiltered list
  - Category: Oversight
  - Disposition: FIX-BEFORE-DONE

- **[NEW] Messages tab sub-tabs and filters**
  - v1 page/feature: `src/pages/Dashboard.tsx` — messages tab with received/sent sub-tabs, user filter, and vehicle filter
  - Gap: v1 had sub-tabs (All / Received / Sent) and dropdowns to filter by sender/recipient and vehicle; v2a shows a flat unfiltered message list
  - Category: Oversight
  - Disposition: DEFER-POST-LAUNCH

## Admin

- **Listing expiry automation**
  - v1 page/feature: `src/components/admin/CheckEndedListingsModal.tsx`, `src/hooks/use-check-ended-listings.ts`
  - Gap: v1 had a modal to bulk-identify expired listings and trigger seller notification emails; v2a admin has no equivalent
  - Category: Oversight
  - Disposition: FIX-BEFORE-DONE

- **Admin analytics charts**
  - v1 page/feature: Admin page — ViewsTrendChart (views over time) and ViewsByGenerationChart
  - Gap: v2a stubs these as "coming soon"; no Recharts implementation exists
  - Category: Oversight
  - Disposition: DEFER-POST-LAUNCH

- **Per-listing inline views analytics in admin**
  - v1 page/feature: Admin.tsx listing rows — clickable detailed view breakdown per listing
  - Gap: v2a shows a static `views_count` number only; no drill-down
  - Category: Oversight
  - Disposition: DEFER-POST-LAUNCH

- **Year Sales pricing**
  - v1 page/feature: `src/pages/YearSales.tsx` — admin tool to enter per-year average sale prices
  - Gap: v2a has no Year Sales admin tool; the History/Generation Detail "live price cards" have no data source
  - Category: Oversight
  - Disposition: FIX-BEFORE-DONE

## UX / Navigation

- **Scroll & state restoration (site-wide)**
  - v1 page/feature: `src/hooks/use-scroll-restoration.ts` + `src/components/ScrollToTop.tsx`, wired to 5 pages
  - Gap: v2a has none of this; navigating Back from a listing/generation detail always lands at the top with no filter/tab state restored
  - Pages affected: Inventory (scroll + carousel positions), Home (scroll + carousel), Dashboard (scroll + active tab + filters), Admin (scroll + active tab + filters), History (scroll, triggered by generation detail)
  - Category: Stack-specific
  - Disposition: FIX-BEFORE-DONE

---

## Completed

<!-- Move entries here (with a one-line "Closed:" note) when the gap is filled. -->
