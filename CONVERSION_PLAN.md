# v1 → v2a Conversion Plan

## STATUS

### Completed

- **Phase 0** — Shared foundation: DB types + framework-agnostic utils/data in `packages/shared`
- **Phase 1** — Tailwind v4 + shadcn/ui in `apps/web` (DTT dark theme, design tokens)
- **Phase 2** — Auth + middleware (Supabase Auth, SSR proxy)
- **Phase 3** — Listing Detail page (SSR + Vehicle JSON-LD)
- **Phase 4** — Inventory page (server-side filtering via URL params, server-side pagination, View by Generation)
- **Phase 5** — Home page (SSR hero, featured listings carousel, JSON-LD)
- **Phase 6** — History pages (`generateStaticParams` for all 8 generations, generation detail with gallery + production stats)
- ✅ **SEO milestone checkpoint PASSED** and independently verified — confirmed working on iMessage, Facebook, LinkedIn, and OpenGraph.
- **Phase 7** — News page (SSR + ItemList JSON-LD, client-side search/filter/sort/bookmarks)
- **Phase 8** — Static/legal pages (About/Mission, Privacy, Terms) + custom 404
- **Phase 9** — Seller & Dealer public profiles (`/seller/[sellerId]`, `/dealer/[dealerId]`) + ContactSeller & MakeOffer dialogs on listing detail
- **Phase 10** — Dashboard + Create/Edit listing (image upload to Supabase Storage, mark-as-sold toggle, snapshot before approved edits)

### Remaining

- **Phase 11** — Forum (index, thread view, bookmarks) ← **NEXT**
- **Phase 12** — Admin section (+ Year Sales pricing that feeds history page live price cards)

---

## Post-launch considerations
Deferred — revisit after core conversion is complete and live.

- Anonymous session tracking + fingerprint analytics
- Real-time listing view counts
- Custom OTP email verification flow
- GA4 event tracking (port `analytics.ts` to client-side calls)
- Sitemap generation (edge function exists; expose as Next.js route or leave as-is)
- Mobile app (separate Expo/React Native app importing `packages/shared`)
- **robots.txt blocking all crawlers** — add before launch; remove/replace with permissive rules at go-live to allow indexing
- **hCaptcha on sign-up form** — Supabase Auth has native hCaptcha support; enable in Supabase dashboard (Auth → Settings) + add widget to AuthForm. Free tier sufficient for current scale.
- **Throwaway email domain blocklist** — client-side check on sign-up against a short blocklist (mailinator, guerrillamail, etc.) before submit; no package required.
- **Admin analytics charts** — ViewsTrendChart (views over time) and ViewsByGenerationChart; stubbed as "coming soon" in Manage Listings. Requires Recharts and queries `listing_views` table.
- **Per-listing inline views analytics in admin** — v1 renders a detailed clickable views breakdown on each listing row; v2a currently shows static `views_count` only.
- **Admin state/scroll restoration** — persist active tab, search filters, and scroll position to `sessionStorage` so navigating back from a listing detail restores your exact position (v1 behavior).
- **Listing expiry automation** — bulk check expired listings and trigger seller notification emails; v1 has `CheckEndedListingsModal` in admin for this workflow.

---

## Conversion-specific decisions

- **Server-side pagination** (`?page=N` in URL), not infinite scroll
- **Edge functions stay in Supabase** — migrate opportunistically only, not proactively
- **Anonymous session tracking deferred** to post-launch
