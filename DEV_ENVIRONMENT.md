# Development Environment

How this repo is set up locally, how it connects to GitHub, Vercel, and Supabase, and what happens when code is pushed. See `TECH_STACK.md` for what the stack is; this doc is about how changes actually flow through it.

## The three services and how they connect

```
GitHub (dropthetop/dropthetop-v2a)
   │  push / PR
   ▼
Vercel  ──build & deploy──▶  apps/web  ──queries──▶  Supabase (Drop-the-Top-v2)
```

- **GitHub** — `https://github.com/dropthetop/dropthetop-v2a` is the single source of truth for code. Vercel is connected to this repo via its native Git integration (not a custom GitHub Actions workflow — there is none in `.github/`).
- **Vercel** — connected to the GitHub repo. Every push triggers a build automatically; no manual deploy step.
  - **Root Directory** is set to `apps/web` in the Vercel project settings (this is why `apps/web/vercel.json` exists at that level).
  - `apps/web/vercel.json` overrides the install step to `cd ../../ && pnpm install` — Vercel's default install runs from the Root Directory, but pnpm workspaces need to resolve from the monorepo root, so this walks back up before installing.
  - Build command: `pnpm build` (→ `next build`). Output: `.next`.
  - Standard Vercel behavior (not something configured in this repo) is that pushes to the branch marked **Production** in the Vercel dashboard deploy to the production URL, and every other branch/PR gets its own **Preview** deployment URL. Based on the branch roles below, `main` is expected to be the Production branch and `develop` (and any feature branches) produce Preview deployments — confirm this in the Vercel dashboard if you need to be sure, since it isn't captured in a repo file.
- **Supabase** — the Supabase CLI is linked to project `Drop-the-Top-v2` (ID `cdnmwwcuwbgpzcrklmbn`), currently doing double duty as both dev and staging. `apps/web` talks to it purely through environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) — there's no hardcoded project reference in application code. Vercel holds its own copy of these env vars (set in the Vercel dashboard), separate from your local `.env.local`.
- **Schema changes are tracked as migration files** in `supabase/migrations/`, committed to the repo — not applied ad hoc. See "Schema changes" under Committing and pushing below. Per `CLAUDE.md`, **never run migrations or alter schema without explicit approval**, regardless of whether it's tracked in a file.
- **Docker Desktop is required locally** for `supabase db pull`/`db dump` (schema diffing) and for optional local Postgres (`supabase start`) — not for the day-to-day `migration new` / `db push` workflow, which connects to the database directly.

## Local setup

1. **Clone** the repo and check out `develop`.
2. **Node** — no `.nvmrc`/`engines` field is pinned in this repo yet; use a current LTS Node (the environment this was built in runs Node 24).
3. **pnpm** — this is a pnpm workspace (`pnpm-workspace.yaml`: `apps/*`, `packages/*`). Install from the **repo root**, not `apps/web`:
   ```
   pnpm install
   ```
4. **Env vars** — copy `apps/web/.env.example` to `apps/web/.env.local` and fill in the three Supabase values (ask for the dev/staging project's URL/anon key/service role key — these are secrets, not stored in the repo). `.env*` files are gitignored.
5. **Run the app**:
   ```
   pnpm dev        # from repo root, filters to the web app
   ```
   or `pnpm --filter web dev` / `cd apps/web && pnpm dev` directly.
6. **Lint / typecheck**:
   ```
   pnpm lint                    # apps/web
   pnpm --filter @dropthetop/shared typecheck
   ```

## Branches

- **`develop`** — where all work happens. This is the default working branch.
- **`main`** — the stable, deployable baseline. Only merge `develop` → `main` when a feature/phase is genuinely ship-ready. Treat a merge to `main` as a real release: it's expected to be (or become) what Vercel serves as Production.

There is currently no separate `staging` branch — `develop` itself, deployed as a Vercel Preview, serves that role against the shared dev/staging Supabase project.

## Committing and pushing

Standard flow, nothing repo-specific beyond "work on `develop`":

1. Make changes on `develop` (or a short-lived feature branch off `develop`, if you want an isolated Preview URL/PR review before merging into `develop`).
2. Commit in small, incremental chunks per logical change/phase — not one giant commit at the end (see `CLAUDE.md` phase workflow).
3. `git push` — this alone triggers a Vercel Preview build for that branch. No separate deploy command; Vercel's GitHub integration handles it.
4. When ready to release, merge `develop` into `main` (PR or direct merge, per your preference) and push `main`. That push triggers the Vercel Production build.
5. Database schema changes are never part of a code deploy — they're a separate, deliberate step (below), sequenced by hand relative to the code push, not triggered by it.

There is no GitHub Actions CI in this repo today (no `.github/workflows`), so **Vercel's build is the only automated gate** — a failed `pnpm build` (typecheck/lint errors that fail the build) blocks the deployment but doesn't block the git push/merge itself.

### Schema changes

`supabase/config.toml` and `supabase/migrations/` are tracked in the repo, starting from `20260921141908_baseline_schema.sql` — a full snapshot of `Drop-the-Top-v2`'s schema at the time tracking was set up, generated via `supabase db pull` after reconciling ~120 pre-existing (untracked) entries in the remote's own migration-history bookkeeping table with `supabase migration repair`.

Going forward, when a feature needs a schema change:

1. `supabase migration new <description>` creates a new timestamped file under `supabase/migrations/`.
2. Write the SQL in that file. Commit it to `develop` alongside the application code that depends on it — schema and the code that needs it should land together, not schema-after-the-fact.
3. Get explicit approval, then apply it with `supabase db push` against the linked `Drop-the-Top-v2` project. **This step is still gated exactly like before**, per `CLAUDE.md` — tracking migrations in files changes what's recorded, not who can pull the trigger; nothing pushes schema automatically, and no Vercel build step touches the database.
4. Nothing here runs database migrations automatically — schema stays a manual, explicitly-approved step, independent of what gets deployed to Vercel. Code deploys and schema changes remain two decoupled events: pushing to `main`/`develop` never changes the database, and running `db push` never triggers a redeploy. So when a feature needs a schema change, get it applied *before* merging the code that depends on it, not after.

Notes on the tooling:
- `supabase migration new` and `supabase db push` connect directly to the database — no Docker needed for the routine workflow.
- `supabase db pull`/`db dump` (re-syncing from remote — e.g. if someone makes a manual dashboard change instead of writing a migration) and `supabase start` (optional local Postgres sandbox) both need Docker Desktop running locally.
- There's still no rollback tooling — reverting a bad migration means writing and applying a new migration that undoes it, not an automatic "down" migration.

Tracked migrations matter beyond just applying schema day-to-day — they get used:

1. **Production launch** — replaying the full migration history against the new, empty production Supabase project is how it gets the same schema as dev/staging, instead of manually recreating it.
2. **Every ongoing feature between now and launch** — not deferred to launch; each schema change gets its own migration file and is applied to `Drop-the-Top-v2` as it's built.
3. **Rebuilding or forking dev/staging** — if `Drop-the-Top-v2` ever needs to be recreated or a second dev project spun up, migrations reconstruct the exact schema instead of relying on dashboard history or memory.
4. **Local Postgres, if adopted later** — `supabase start` (Docker) builds a local database by replaying the same migration files, so local matches remote exactly.
5. **Onboarding a second developer** — anyone new can stand up a schema-accurate environment from the migration files alone.
6. **Audit trail / debugging** — "when did this column get added, and why" becomes answerable from a filename and its SQL, not guesswork.
7. **Mobile app later** — `packages/shared`'s generated DB types come from the schema; a clean migration history makes schema/type changes easier to reason about as the Expo app starts consuming `@dropthetop/shared`.

## Path to a production environment

Today, "production" (the `main` branch / Vercel Production deployment) still points at the same Supabase project as dev/staging (`Drop-the-Top-v2`). That's intentional during conversion — see `CONVERSION_PLAN.md` — but it means `main` is not yet a fully isolated production environment. Per `CLAUDE.md` and the project memory, going to a real production setup means:

1. **Provision a dedicated production Supabase project** (tracked in `BACKLOG.md`) — a fresh, empty project, created only at actual launch, not before. With migrations now tracked, getting it to the same schema as `Drop-the-Top-v2` is `supabase link` to the new project + `supabase db push` to replay every file in `supabase/migrations/` in order, rather than manually recreating the schema. Auth users and Storage buckets still start empty and are a separate concern from schema.
2. **Point Vercel's Production environment env vars** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` on the Production environment specifically, distinct from Preview/Development env vars in the Vercel dashboard) at the new production Supabase project, while Preview deployments (`develop`, feature branches) keep pointing at `Drop-the-Top-v2` as dev/staging.
3. **Confirm/set the Vercel Production branch to `main`** and the production domain, if not already configured that way.
4. Continue treating a `develop` → `main` merge as the release gate — once step 2 is done, that merge is what actually ships to real users against real data, so the "only merge when ship-ready" rule in `CLAUDE.md` starts carrying real weight.

No timeline is committed for this — it happens at launch, not before.
