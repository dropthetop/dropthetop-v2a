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
- **Supabase** — `supabase/.temp/linked-project.json` links the local Supabase CLI to project `Drop-the-Top-v2` (ID `cdnmwwcuwbgpzcrklmbn`), currently doing double duty as both dev and staging. `apps/web` talks to it purely through environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) — there's no hardcoded project reference in application code. Vercel holds its own copy of these env vars (set in the Vercel dashboard), separate from your local `.env.local`.
- There is no committed `supabase/migrations` directory — schema changes are made directly against the linked project (dashboard or `supabase` CLI commands), not via tracked migration files. Per `CLAUDE.md`, **never run migrations or alter schema without explicit approval.**

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
5. Nothing here runs database migrations automatically — schema stays entirely manual and requires explicit approval, independent of what gets deployed to Vercel.

   Concretely:
   - There's no `supabase/config.toml` or `supabase/migrations/` directory tracked in this repo — only `supabase/.temp/linked-project.json`, which just points the local `supabase` CLI at the `Drop-the-Top-v2` project for convenience (e.g. `supabase db pull`, generating types). It isn't a migration history.
   - No script, GitHub Action, or Vercel build step ever runs `supabase db push`, applies a `.sql` file, or otherwise touches schema. Vercel's build only runs `pnpm build` — it builds and ships application code, nothing database-related.
   - The only way schema changes today is a person manually running SQL — via the Supabase dashboard's SQL editor, or the `supabase` CLI against the linked project — and per `CLAUDE.md`, that requires explicit user approval every time, no exceptions.
   - Practical consequence: **code deploys and schema changes are two fully decoupled events.** Pushing to `main`/`develop` never changes the database, and changing the database never triggers a redeploy. That means it's possible to ship application code that expects a column/table that doesn't exist yet (or vice versa) if the two aren't sequenced deliberately — so when a feature needs a schema change, get it applied *before* merging the code that depends on it, not after.
   - This is also why there's no rollback story for schema today: an approved SQL change is a one-way door unless someone manually writes and applies the reverse SQL. Worth revisiting (tracked migration files + `supabase db push` in CI) once schema changes become frequent enough to need one — not needed yet at this stage.

There is no GitHub Actions CI in this repo today (no `.github/workflows`), so **Vercel's build is the only automated gate** — a failed `pnpm build` (typecheck/lint errors that fail the build) blocks the deployment but doesn't block the git push/merge itself.

## Path to a production environment

Today, "production" (the `main` branch / Vercel Production deployment) still points at the same Supabase project as dev/staging (`Drop-the-Top-v2`). That's intentional during conversion — see `CONVERSION_PLAN.md` — but it means `main` is not yet a fully isolated production environment. Per `CLAUDE.md` and the project memory, going to a real production setup means:

1. **Provision a dedicated production Supabase project** (tracked in `BACKLOG.md`) — a fresh project, schema migrated over from `Drop-the-Top-v2` (its own Auth users, its own Storage buckets), created only at actual launch, not before.
2. **Point Vercel's Production environment env vars** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` on the Production environment specifically, distinct from Preview/Development env vars in the Vercel dashboard) at the new production Supabase project, while Preview deployments (`develop`, feature branches) keep pointing at `Drop-the-Top-v2` as dev/staging.
3. **Confirm/set the Vercel Production branch to `main`** and the production domain, if not already configured that way.
4. Continue treating a `develop` → `main` merge as the release gate — once step 2 is done, that merge is what actually ships to real users against real data, so the "only merge when ship-ready" rule in `CLAUDE.md` starts carrying real weight.

No timeline is committed for this — it happens at launch, not before.
