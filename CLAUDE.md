# dropthetop-v2a

Next.js App Router + TypeScript monorepo. This is the go-forward web app. A React Native (Expo) app will share `packages/shared` later.

## Structure
- `apps/web` — Next.js App Router, TypeScript, deployed on Vercel
- `packages/shared` — framework-agnostic: Supabase client factory, generated DB types, data-access functions, validation, business logic. **No Next.js imports. No DOM assumptions. No web-only packages.** Expo/React Native will import this.

## Database
- Dev/staging: Supabase project `Drop-the-Top-v2` (ID: `cdnmwwcuwbgpzcrklmbn`)
- Production database: to be created at launch — not yet provisioned
- Auth: Supabase Auth (unchanged from v1)
- **Do not run migrations, push schema, or alter this database without explicit user approval.**

## SSR requirement (non-negotiable)
Public, SEO-critical pages (listings, inventory, listing detail, vehicle/generation history, and news) must use real SSR via Server Components and `generateMetadata`. Never client-fetch-plus-inject for content that needs to be indexed. This is the primary reason Expo Router for web was abandoned.

## packages/shared discipline
Everything in `packages/shared` must be importable by a React Native (Expo) app. That means:
- No `next/*` imports
- No `window`, `document`, or other DOM globals
- No web-only packages (e.g. no `next-auth`)
- Env vars are injected by the consumer (`apps/web`), not accessed inside `packages/shared`

## Rejected paths — do not revisit without strong new reason
- **Expo Router for web** — abandoned. Could not deliver real SSR needed for SEO.
- **Clerk** — rejected. Keeping Supabase Auth throughout.
- **Capacitor wrapper** — rejected. Conflicts with SSR architecture.
- **Mobile as part of this monorepo** — mobile will be a separate Expo app that imports `packages/shared` as a dependency. It does not live in `apps/`.

## v1 source of truth
Feature conversion reads from v1 (`/Users/toddheemsoth/Documents/dropthetop-owned`) directly by absolute path — sibling folders on disk. No cloning, no pasting. Do not modify v1.

## Conversion plan
`CONVERSION_PLAN.md` (repo root) is the source of truth for phase status, constraints, and key decisions. Update it — moving phases from Remaining to Completed and advancing the NEXT marker — when each phase ships.
