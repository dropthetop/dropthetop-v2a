# Backlog

Living list of future ideas and deferred work. Add freely; nothing here is committed to a timeline.

---

## SEO & Growth

- **robots.txt** — currently blocking all crawlers (added pre-launch); replace with permissive rules + Sitemap pointer at go-live

## Auth & Security

- **hCaptcha on sign-up form** — Supabase Auth has native hCaptcha support; enable in Supabase dashboard (Auth → Settings) + add widget to AuthForm. Free tier sufficient for current scale.
- **Throwaway email domain blocklist** — client-side check on sign-up against a short blocklist (mailinator, guerrillamail, etc.) before submit; no package required.
- **Custom OTP email verification flow** — replace Supabase's default magic-link email with a custom OTP code UX

## Infrastructure & Ops

- **Production database provisioning** — production Supabase project not yet created; provision at launch
- **Mobile app** — separate Expo/React Native app that imports `packages/shared` as a dependency; does not live in this monorepo

---

## NEEDS REVIEW — ambiguous

- **Real-time listing view counts** — originally described as "live view counter on listing detail pages." v1 did NOT show a public-facing view counter on the listing detail page itself (views were tracked silently). However, v1 DID surface view analytics to sellers in the Dashboard (`ListingViewsAnalytics` component — an Eye button per listing showing total/member/guest counts + activity log). As written this item is a new idea; the adjacent seller dashboard gap has been moved to CONVERSION_GAPS.md as "Seller per-listing view analytics." Decide: does this item mean a public counter on listing detail (new idea, keep here), should it be removed as now redundant with the gap entry, or does it mean something else?
