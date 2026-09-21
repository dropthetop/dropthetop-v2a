# Backlog

Living list of future ideas and deferred work. Add freely; nothing here is committed to a timeline.

---

## SEO & Growth

- **robots.txt** — currently blocking all crawlers (added pre-launch); replace with permissive rules + Sitemap pointer at go-live

## Auth & Security

- **hCaptcha on sign-up form** — Supabase Auth has native hCaptcha support; enable in Supabase dashboard (Auth → Settings) + add widget to AuthForm. Free tier sufficient for current scale.
- **Throwaway email domain blocklist** — client-side check on sign-up against a short blocklist (mailinator, guerrillamail, etc.) before submit; no package required.
- **Custom OTP email verification flow** — replace Supabase's default magic-link email with a custom OTP code UX
- **Reconcile v1's admin/new-user seed trigger change** — v1 (`dropthetop-owned`) has an uncommitted, not-yet-finalized edit to `supabase/migrations/20260610000002_seed_admin_user.sql` changing the new-user profile trigger from inserting `full_name`/`avatar_url` to inserting `contact_email` (from `NEW.email`) with `ON CONFLICT (id) DO NOTHING`. Once that lands in v1, decide whether v2a's schema/trigger should adopt the same behavior.

## Infrastructure & Ops

- **Production database provisioning** — production Supabase project not yet created; provision at launch
- **Mobile app** — separate Expo/React Native app that imports `packages/shared` as a dependency; does not live in this monorepo
- **Pin down `@dropthetop/shared` dependency mechanism for mobile** — decide how the separate Expo app will consume the package (published to an internal/private registry, git dependency, `file:`/tarball reference, etc.); see TECH_STACK.md's "Path to native iOS/Android" section

