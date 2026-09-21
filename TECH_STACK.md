# Tech Stack

This is a snapshot of the technology chosen for dropthetop-v2a, why it was chosen, and how the pieces fit together — including the path to native iOS/Android apps. See `VISION.md` for the product reasoning and `CLAUDE.md` for day-to-day working rules.

## Monorepo

- **pnpm workspaces** (`pnpm-workspace.yaml`) — `apps/*` and `packages/*`. No Turborepo; the root `package.json` just filters into `web` (`pnpm --filter web dev/build/lint`).
- **TypeScript** everywhere, `^5`, no `any`-friendly config assumed.

```
apps/
  web/              # Next.js app — the only app today
packages/
  shared/            # @dropthetop/shared — framework-agnostic
supabase/            # Supabase CLI project link (migrations live in the Supabase project)
```

## apps/web — the web app

- **Next.js 16 (App Router)**, React 19, deployed on **Vercel** (`vercel.json` runs `pnpm install` from the repo root, then `pnpm build`).
- **Server Components + `generateMetadata` for every public page** (listings, inventory, listing detail, generation/vehicle history, news). This is a hard requirement, not a preference — see the SSR section of `CLAUDE.md`. It's also *why* Expo Router for web and a Capacitor wrapper were both rejected: neither could deliver real SSR for SEO-critical pages.
- **Styling/UI**: Tailwind v4 + shadcn/ui (built on Radix primitives via `@base-ui/react` / `@radix-ui/react-icons`), `class-variance-authority`, `tailwind-merge`, `next-themes` for the dark theme.
- **Forms/validation**: `react-hook-form` + `@hookform/resolvers` + `zod`.
- **Data viz / misc UI**: `recharts`, `embla-carousel-react`, `cmdk`, `sonner`, `vaul`, `react-day-picker`.
- **Auth**: Supabase Auth via `@supabase/ssr`, wired through `apps/web/lib/supabase/{client,server}.ts` and `apps/web/proxy.ts` (SSR-aware cookie-based session handling — not `next-auth`, which is explicitly rejected because it doesn't port to React Native).

## packages/shared — the portable core

`@dropthetop/shared` holds everything that isn't Next.js- or DOM-specific, so it can be dropped into a future Expo app unchanged:

- Supabase **client factory** (`createSupabaseClient(url, anonKey)`) — plain `@supabase/supabase-js`, no Next.js cookie/session plumbing. `apps/web` wraps this with its own SSR-aware client in `apps/web/lib/supabase/`; a future mobile app would wrap the same factory with Expo's own session storage (e.g. `expo-secure-store`) instead.
- Generated **database types** (`src/types/database.ts`) from the Supabase schema.
- **Data-access functions** (`src/queries/`) — all Supabase queries for listings, generations, news, etc. live here. Per `CLAUDE.md`, no page or component in `apps/web` runs an inline query; everything goes through this layer, which is also what makes the data layer reusable from mobile.
- **Business logic / helpers** (`src/lib/`) — URL builders, listing-card formatting, image helpers.
- **Static domain data** (`src/data/`) — Corvette models, generations, production stats, US states.
- Explicit constraints enforced by convention (see `CLAUDE.md`): no `next/*` imports, no `window`/`document`, no web-only packages, no env var access inside the package — env vars are injected by whichever app consumes it.

## Database & Auth

- **Supabase** for Postgres, Auth, and Storage. Dev/staging project `Drop-the-Top-v2` (`cdnmwwcuwbgpzcrklmbn`); production project not yet provisioned. `supabase/` holds the CLI project link.
- Schema changes go through the Supabase CLI/dashboard, not ad hoc — and never without explicit approval (`CLAUDE.md`).
- Two server-side client flavors in `apps/web/lib/supabase/server.ts`: a cookie-scoped client (RLS-respecting, per-user) and an admin client (service-role key) for privileged server actions.
- **Schema changes are tracked as migration files** in `supabase/migrations/` (Supabase CLI), committed to git alongside the app code that depends on them, rather than applied ad hoc with nothing recorded. See `DEV_ENVIRONMENT.md` for the day-to-day workflow. Tracked migrations matter beyond just applying schema — they get used:
  1. **Production launch** — replaying the full migration history against the new, empty production Supabase project is how it gets the same schema as dev/staging, instead of manually recreating it.
  2. **Every ongoing feature between now and launch** — not deferred to launch; each schema change gets its own migration file and is applied to `Drop-the-Top-v2` as it's built.
  3. **Rebuilding or forking dev/staging** — if `Drop-the-Top-v2` ever needs to be recreated or a second dev project spun up, migrations reconstruct the exact schema instead of relying on dashboard history or memory.
  4. **Local Postgres, if adopted later** — `supabase start` (Docker) builds a local database by replaying the same migration files, so local matches remote exactly.
  5. **Onboarding a second developer** — anyone new can stand up a schema-accurate environment from the migration files alone.
  6. **Audit trail / debugging** — "when did this column get added, and why" becomes answerable from a filename and its SQL, not guesswork.
  7. **Mobile app later** — `packages/shared`'s generated DB types come from the schema; a clean migration history makes schema/type changes easier to reason about as the Expo app starts consuming `@dropthetop/shared`.

## Third-party integrations

All four live inside **Supabase Edge Functions** (Deno, deployed to the Supabase project) — `apps/web` never calls these services directly and doesn't hold their credentials. It calls the edge function, which holds the API key server-side. All are already deployed and `ACTIVE` on `Drop-the-Top-v2` (`supabase functions list`), carried over from v1.

- **Firecrawl** — web scraping/JS-rendering for pulling data from external sites. Used by `fetch-external-listings`, `fetch-listing-preview`, `fetch-external-images`, `scrape-corvette-news`. Env var: `FIRECRAWL_API_KEY`.
- **Resend** — transactional email (approvals, offers, messages, listing notifications). Used by `send-email`. Env var: `RESEND_API_KEY`.
- **OpenAI** (`gpt-4o-mini` + image generation) — AI summaries for scraped news articles, plus `scrape-corvette-sales`, `generate-article-image`, `generate-app-icon`. Env var: `OPENAI_API_KEY`.
- **Google Analytics (GA4)** — the edge function `get-ga4-config` exists and is deployed, but per `CONVERSION_GAPS.md` the app-side GA4 instrumentation itself is **not yet wired into `apps/web`** — this is deployed infrastructure without a caller yet. Env var: `GA4_MEASUREMENT_ID`.

**Where the env vars live:** these four are Supabase **Edge Function secrets** (`supabase secrets list` / `supabase secrets set`), scoped per-project — a completely separate mechanism from `apps/web`'s `.env.local` (which only holds the three Supabase client vars) and separate from `supabase/migrations/` (secrets are not schema; `db push` never touches them). Confirmed currently set on `Drop-the-Top-v2`: `FIRECRAWL_API_KEY`, `GA4_MEASUREMENT_ID`, `OPENAI_API_KEY`, `RESEND_API_KEY` (alongside Supabase's own auto-injected `SUPABASE_URL`/`SUPABASE_ANON_KEY`/etc., which every function gets for free and never need manual setup).

**Production implication:** when the dedicated production Supabase project is provisioned (see `DEV_ENVIRONMENT.md`), these four secrets need to be set again on that project explicitly — `supabase link`-ing to it and `db push`-ing migrations brings the schema over, but **not** edge function secrets or the functions themselves (those need `supabase functions deploy` + `supabase secrets set` separately). Worth its own `BACKLOG.md` item once production provisioning gets closer.

**Planned, not yet live:** hCaptcha (Supabase Auth's native integration) is tracked in `BACKLOG.md` under Auth & Security — not enabled yet, no secret configured.

## Rejected alternatives (don't revisit without a strong new reason)

| Option | Why rejected |
|---|---|
| Expo Router for web | Could not deliver real SSR needed for SEO on public pages |
| Clerk | Staying on Supabase Auth end-to-end |
| Capacitor wrapper | Conflicts with the SSR architecture the web app depends on |
| Mobile inside this monorepo's `apps/` | Mobile is a separate Expo project, not a workspace app here |

## Path to native iOS/Android

The mobile strategy is deliberately deferred until the web platform is proven (see `VISION.md`), and deliberately *not* Capacitor-wrapped web:

1. **Separate Expo (React Native) project**, outside this repo's `apps/` folder — it is not a monorepo workspace app, it *depends on* one.
2. It installs `@dropthetop/shared` as a package dependency (published internally or via a workspace/`file:`/git reference — not yet decided) to reuse:
   - the Supabase client factory (rewrapped with Expo-appropriate session storage)
   - all data-access functions in `queries/`
   - business logic, formatting helpers, and static domain data
   - generated database types, so mobile and web stay in sync automatically when the schema changes
3. What mobile does **not** get from `packages/shared`: any UI. shadcn/ui, Tailwind, and the Next.js pages are web-only; native screens are built fresh with React Native primitives (or a RN component library chosen at that time).
4. Auth carries over conceptually (Supabase Auth) but the client-session wiring is platform-specific — `apps/web/lib/supabase/*` is *not* portable, only `packages/shared`'s bare factory is.
5. Because `packages/shared` already excludes Next.js imports, DOM globals, and web-only packages, and takes env vars from the consumer rather than reading them itself, the mobile app should be able to adopt it with no changes to the package — that constraint is enforced now specifically to make this step low-friction later.

This step has no committed timeline; it starts once the web platform is validated post-launch, per `VISION.md`.
