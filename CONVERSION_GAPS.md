# Conversion Gaps

Features and behaviors v1 had that v2a does not yet implement.
Ordered roughly by area, not priority.

---

## SEO & Growth

- **Sitemap generation**
  - v1 page/feature: `public/robots.txt` → Supabase edge function `generate-sitemap`
  - Gap: v2a blocks all crawlers with no sitemap reference; the edge function exists but is not exposed or wired

## Analytics

- **GA4 event tracking**
  - v1 page/feature: `src/lib/analytics.ts`, called from Auth, ListingDetail, Dashboard, and other pages
  - Gap: v2a has no GA4 instrumentation; page_view, view_item, generate_lead, add_to_cart, sign_up, login, and password_reset events are all missing

- **Anonymous session + fingerprint analytics**
  - v1 page/feature: `src/hooks/use-fingerprint-analytics.ts`, `src/components/admin/FingerprintTrackingAnalytics.tsx`
  - Gap: v1 tracked non-authenticated visitors via browser fingerprint + session ID and surfaced deduplication stats in admin; v2a does not track anonymous sessions at all

## Dashboard

- **Seller per-listing view analytics**
  - v1 page/feature: `src/components/dashboard/ListingViewsAnalytics.tsx`, used in Dashboard seller listings tab
  - Gap: v1 showed sellers an Eye button per listing that opened a dialog with total/member/guest view counts and a timestamped activity log; v2a shows no view stats to sellers

- **Real-time listing view counts**
  - v1 page/feature: `src/hooks/use-listing-views.ts`, `trackListingView` called from ListingDetail; view data stored in `listing_views` table
  - Gap: v1 tracked views on listing detail but the underlying data (total, member, guest counts) was never surfaced on the public listing detail page itself; a public-facing view counter is not yet implemented in v2a. Originally described as "live view counter on listing detail pages." v1 did NOT show a public-facing view counter on the listing detail page itself (views were tracked silently). However, v1 DID surface view analytics to sellers in the Dashboard (`ListingViewsAnalytics` component — an Eye button per listing showing total/member/guest counts + activity log). The adjacent seller dashboard gap is captured above as "Seller per-listing view analytics."

## Admin

- **Listing expiry automation**
  - v1 page/feature: `src/components/admin/CheckEndedListingsModal.tsx`, `src/hooks/use-check-ended-listings.ts`
  - Gap: v1 had a modal to bulk-identify expired listings and trigger seller notification emails; v2a admin has no equivalent

- **Admin analytics charts**
  - v1 page/feature: Admin page — ViewsTrendChart (views over time) and ViewsByGenerationChart
  - Gap: v2a stubs these as "coming soon"; no Recharts implementation exists

- **Per-listing inline views analytics in admin**
  - v1 page/feature: Admin.tsx listing rows — clickable detailed view breakdown per listing
  - Gap: v2a shows a static `views_count` number only; no drill-down

- **Year Sales pricing**
  - v1 page/feature: `src/pages/YearSales.tsx` — admin tool to enter per-year average sale prices
  - Gap: v2a has no Year Sales admin tool; the History/Generation Detail "live price cards" have no data source

## UX / Navigation

- **Scroll & state restoration (site-wide)**
  - v1 page/feature: `src/hooks/use-scroll-restoration.ts` + `src/components/ScrollToTop.tsx`, wired to 5 pages
  - Gap: v2a has none of this; navigating Back from a listing/generation detail always lands at the top of the page with no filter/tab state restored
  - Pages affected: Inventory (scroll + carousel positions), Home (scroll + carousel), Dashboard (scroll + active tab + filters), Admin (scroll + active tab + filters), History (scroll, triggered by generation detail)
