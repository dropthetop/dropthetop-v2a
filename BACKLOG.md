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
- **Admin state/scroll restoration** — persist active tab, search filters, and scroll position to `sessionStorage` so navigating back from a listing detail restores your exact position (v1 behavior).

## Infrastructure & Cleanup

- **Production database provisioning** — production Supabase project not yet created; provision at launch
- **Mobile app** — separate Expo/React Native app that imports `packages/shared` as a dependency; does not live in this monorepo
