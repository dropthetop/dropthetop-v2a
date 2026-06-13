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
- **Phase 12** — Admin section: layout, nav, Manage Listings with full v1 feature parity (approve/reject/feature/delete, expiration editor, listing history, change diff viewer, realtime views counter, stat cards). Year Sales pricing deferred to `BACKLOG.md`.

### Remaining

- **Phase 11** — Forum (index, thread view, bookmarks) ← **NEXT**
- **Phase 13** — Remaining admin pages: Manage Users, Manage News, Fetch External Listings, Manage Lookups, External Links analytics, Launch Emails, Email Previews (all currently stubs)

---

## Conversion gaps

Features and behaviors v1 had that v2a does not yet implement are tracked in `CONVERSION_GAPS.md` at the repo root. These are regressions from v1 — not new ideas — and should be closed before considering the conversion complete.

## Post-launch / Future work

See `BACKLOG.md` at the repo root.

---

## Conversion-specific decisions

- **Server-side pagination** (`?page=N` in URL), not infinite scroll
- **Edge functions stay in Supabase** — migrate opportunistically only, not proactively
- **Anonymous session tracking deferred** to post-launch
