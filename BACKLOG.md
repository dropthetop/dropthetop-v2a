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

