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

### Remaining

- **Phase 9** — Seller & Dealer pages (public profiles, MakeOffer + ContactSeller dialogs on listing detail) ← **NEXT**
- **Phase 10** — Dashboard + Create/Edit listing (image upload to Supabase Storage)
- **Phase 11** — Forum (index, thread view, bookmarks)
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

---

## Conversion-specific decisions

- **Server-side pagination** (`?page=N` in URL), not infinite scroll
- **Edge functions stay in Supabase** — migrate opportunistically only, not proactively
- **Anonymous session tracking deferred** to post-launch
