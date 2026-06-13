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

Every public page must:
- Render full content in `view-source` — no JS-filled blank divs
- Have a `generateMetadata` export

## packages/shared discipline
Everything in `packages/shared` must be importable by a React Native (Expo) app. That means:
- No `next/*` imports
- No `window`, `document`, or other DOM globals
- No web-only packages (e.g. no `next-auth`)
- Env vars are injected by the consumer (`apps/web`), not accessed inside `packages/shared`

## Data access discipline
All Supabase queries go through `packages/shared/src/data/` — no inline queries in page or component files.

## Branch workflow
All work on `develop`. `main` is the stable deployable baseline — only merge when a feature is ship-ready.

## Rejected paths — do not revisit without strong new reason
- **Expo Router for web** — abandoned. Could not deliver real SSR needed for SEO.
- **Clerk** — rejected. Keeping Supabase Auth throughout.
- **Capacitor wrapper** — rejected. Conflicts with SSR architecture.
- **Mobile as part of this monorepo** — mobile will be a separate Expo app that imports `packages/shared` as a dependency. It does not live in `apps/`.

## v1 source of truth
Feature conversion reads from v1 (`/Users/toddheemsoth/Documents/dropthetop-owned`) directly by absolute path — sibling folders on disk. No cloning, no pasting. Do not modify v1. Never read from or copy v2 (`dropthetop-v2`).

## Conversion plan
`CONVERSION_PLAN.md` (repo root) is the source of truth for phase status and conversion-specific decisions. Update it — moving phases from Remaining to Completed and advancing the NEXT marker — when each phase ships.

## Backlog
`BACKLOG.md` (repo root) is the living list of future ideas and deferred work. Add items there rather than to `CONVERSION_PLAN.md`.

## Conversion gaps
`CONVERSION_GAPS.md` (repo root) tracks features and behaviors v1 had that v2a doesn't yet implement — regressions, not new ideas. When working on a feature that corresponds to a gap entry, move it to the Completed section at the bottom of `CONVERSION_GAPS.md` when the gap is filled. When you discover a new v1 regression during implementation, add it there rather than to `BACKLOG.md`.

## Omissions are decisions, not defaults
When converting any v1 page or feature, if you choose not to carry over a v1 behavior — for any reason — say so explicitly at the time you make the decision, before completing the task. State what you are omitting and why. Do not silently skip v1 features and wait to be asked. The owner decides what gets dropped; you surface the choice.
