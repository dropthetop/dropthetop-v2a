# Backlog

Living list of future ideas and deferred work. Add freely; nothing here is committed to a timeline.

---

## SEO & Growth

- **Sitemap generation** — edge function already exists; expose as a Next.js route or leave as-is and wire to Search Console at launch
- **GA4 event tracking** — port `analytics.ts` from v1 to client-side calls in v2a
- **robots.txt** — currently blocking all crawlers (added pre-launch); replace with permissive rules + Sitemap pointer at go-live

## Auth & Security

- **hCaptcha on sign-up form** — Supabase Auth has native hCaptcha support; enable in Supabase dashboard (Auth → Settings) + add widget to AuthForm. Free tier sufficient for current scale.
- **Throwaway email domain blocklist** — client-side check on sign-up against a short blocklist (mailinator, guerrillamail, etc.) before submit; no package required.
- **Custom OTP email verification flow** — replace Supabase's default magic-link email with a custom OTP code UX

## User Features

- **Anonymous session tracking + fingerprint analytics** — track non-authenticated sessions for funnel analysis
- **Real-time listing view counts** — live view counter on listing detail pages; foundation the admin charts also depend on
- **Listing expiry automation** — bulk check expired listings and trigger seller notification emails; v1 has `CheckEndedListingsModal` in admin for this workflow

## Admin

- **Admin analytics charts** — ViewsTrendChart (views over time) and ViewsByGenerationChart; currently stubbed as "coming soon" in Manage Listings. Requires Recharts and queries `listing_views` table.
- **Per-listing inline views analytics in admin** — v1 renders a detailed clickable views breakdown on each listing row; v2a currently shows static `views_count` only.

## Scroll & State Restoration (site-wide)

v1 has a shared `useScrollRestoration` hook plus a `ScrollToTop` component that tracks route transitions and sets/clears `sessionStorage` flags. When a user navigates to a detail page and presses Back, the originating page restores its exact state. Pages affected and what each restores:

| Page | What is saved |
|---|---|
| **Inventory** (`/inventory`) | Scroll position, per-generation carousel positions |
| **Home** (`/`) | Scroll position, featured listings carousel position |
| **Dashboard** (`/dashboard`) | Scroll position, active tab, search/filter state |
| **Admin** (`/admin`) | Scroll position, active tab, search/filter state |
| **History** (`/history`) | Scroll position (trigger: returning from a generation detail, not a listing detail) |

Implementation note: v1's `ScrollToTop` component wraps the entire router and sets a `should-restore-scroll-{page}` flag before navigating away to a detail page; on return, each page reads that flag and re-applies saved state. The pattern is the same for all five pages — implement once as a shared hook and wire it into each.

## Infrastructure & Cleanup

- **Production database provisioning** — production Supabase project not yet created; provision at launch
- **Mobile app** — separate Expo/React Native app that imports `packages/shared` as a dependency; does not live in this monorepo
