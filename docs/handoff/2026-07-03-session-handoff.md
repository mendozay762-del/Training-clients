# Session Handoff — 2026-07-03 (Trainer Clients)

> **Read this first in the new chat.** It captures exactly what happened in the
> previous session so you can continue seamlessly. The older docs in
> `docs/handoff/1-*.md … 4-*.md` are **STALE** (they predate the workouts,
> auth, program, and mesocycle features) — trust THIS document over them.

---

## 0. How to resume (do this first)

The app deploys from and lives on branch **`claude/review-project-docs-byiwx`**
(this is Vercel's **production** branch — pushing to it auto-deploys).
`claude/vigilant-hawking-zOQtT` is an identical mirror. Both are at commit
**`ebab476`**.

In the new session, get onto the exact state:

```bash
git fetch origin
git checkout claude/review-project-docs-byiwx
git pull origin claude/review-project-docs-byiwx
git rev-parse --short HEAD   # must print: ebab476
```

Then `pnpm install` before running typecheck/lint/test/build.

---

## 1. What this project is

- **Trainer Clients** — a private **Next.js 15 PWA** for one solo personal
  trainer (**Yamil**) to manage 1–5 clients. Clients never log in; the trainer
  is the only user (there's a login gate).
- **Stack:** Next.js 15 (App Router, RSC + Server Actions), TypeScript strict,
  Tailwind + shadcn primitives, **Drizzle ORM** on **Neon Postgres**, deployed
  on **Vercel**. Tests: vitest. Package manager: **pnpm**.
- **Primary client in play:** **Andy** (one paying client). His program is a
  training block named **"Cut Hypertrophy."**

## 2. Critical infrastructure facts (these caused pain — internalize them)

- **Production branch = `claude/review-project-docs-byiwx`.** Vercel deploys it
  automatically on push. (An older handoff doc claims `trainer-pwa-setup` is
  production — that is **WRONG**.) Live URL: **`training-clients.vercel.app`**.
- **Database = Neon**, project **"Trainer Clients"**, branch **`production`**,
  database **`neondb`**. Connection via `DATABASE_URL`.
- **This container/agent CANNOT reach Neon** (network policy blocks it). So
  **schema migrations are applied by hand**: edit `src/db/schema.ts` →
  `pnpm db:generate` → give the trainer the SQL → **they paste it into Neon's
  web SQL Editor** (branch `production`, db `neondb`).
- **Verify a migration actually applied** (don't trust "success" messages):
  either check Vercel runtime errors for `column … does not exist`, or have the
  trainer run a clean `SELECT column_name FROM information_schema.columns WHERE
  table_name='…' AND column_name='…';` and confirm it returns a row. (A
  mesocycle-column migration silently failed once this session; a clean re-run
  fixed it.)
- **Deploy/verify from the agent** via the Vercel MCP tools
  (`list_deployments`, `get_runtime_errors`). They're occasionally flaky —
  retry.
- **Migration ordering rule:** if a change adds a DB column the code reads, the
  **SQL must be applied BEFORE the code is deployed**, or the page crashes with
  `column does not exist`. Apply SQL → then push.

## 3. What was built this session (6 commits, on top of `488373b`)

| Commit | What |
|---|---|
| `2d63fd9` | **Per-set RIR/rep targets + set notes + weight-first entry.** Requires migration **0008**. |
| `d3541bd` | **Bulk-delete tools** on the program page: "Delete week" + "Cut from here." |
| `8d568df` | **Mesocycles within a program.** Requires migration **0009**. |
| `0a5e4b3` | **Protect logged days across every delete path** (code-review fixes). |
| `62b3080` | **"Add to program"** button for hand-logged sessions. |
| `ebab476` | **Show the logged session's sets/reps on a program day.** |

### 3a. Per-set RIR / reps (`2d63fd9`, migration 0008)
- New table **`prescribed_sets`** (per-set prescription: `reps_low/high/text`,
  `rir_low/high`) + `rir_low/rir_high` on `prescribed_exercises` +
  **`notes`** column on `workout_sets`.
- The sheet importer accepts **per-set values split by `|`** and **RIR ranges**
  (e.g. `1-2 | 1-2 | 0-1`); a single value broadcasts to all sets.
- Live logging shows the prescribed **rep range + RIR** as a faint target above
  each set's box (persists after you enter the actual value).
- Per-set **note** affordance on each set row. Set-row order is **weight → reps
  → RPE → RIR** (weight first).

### 3b. Bulk-delete tools (`d3541bd`)
- On the program (block) page, each week header has **"Delete week"** and
  **"Cut from here ↓"** (this week + all later weeks).
- **Logged days are never deleted** — the actions filter `isNull(actualWorkoutId)`.

### 3c. Mesocycles within a program (`8d568df`, migration 0009)
- New column **`prescribed_workouts.mesocycle`** (text). Backfilled to
  `'Mesocycle 1'` for existing rows.
- A program (training_block, e.g. "Cut Hypertrophy") now groups days
  **Mesocycle → Week → Day**. Weeks are numbered **within** each mesocycle, so a
  mesocycle can be **any length (4–6 weeks)**.
- The **mesocycle name is set once in the import form** (NOT a CSV column). The
  form pre-fills the next name (e.g. "Mesocycle 2"). Each import = one mesocycle.
- Coaching model agreed with the trainer: **build one mesocycle at a time**
  (autoregulation), all under one persistent Program.

### 3d. Logged-day protection everywhere (`0a5e4b3`)
- The import's **"replace existing"** and the **single-day delete** now also
  skip logged days (`isNull(actualWorkoutId)`); single delete is block-scoped;
  the Delete button is hidden on a logged day's detail page.

### 3e. "Add to program" for hand-logged sessions (`62b3080`)
- A workout logged by hand (not started from the program) shows an **"Add to
  program"** button on its session page — only when it isn't already in a
  program.
- The action `addWorkoutToProgram`: if a planned day exists on that date → links
  the session to it (marks completed); else **creates a completed day** on that
  date in the mesocycle it belongs to (the latest mesocycle on/before the date).
- Detection: a workout is "in a program" iff a `prescribed_workouts` row has
  `actual_workout_id = workout.id` (surfaced as `inProgram` from
  `getWorkoutDetail`).

### 3f. Logged data on the program day (`ebab476`)
- A program day linked to a logged session now renders a **"Logged session"**
  section with the real sets (weight × reps · RIR/RPE, per-set notes), so
  hand-added days aren't blank. `getPrescribedWorkoutDetail` now returns
  `logged`.

## 4. Program / mesocycle model + sheet format

Hierarchy: **Program → Mesocycle → Week → Day → Exercise → Set.**
Full spec + a paste-ready 4-week example were delivered to the trainer as
separate files (`program-sheet-format.md`, `andy-4-week-upper-lower.csv`,
`trainer-clients-program-model.md`). Import format essentials:

- Columns: `prescribed_for, workout_name, exercise_name, sets, reps, load, rpe, rir, notes`.
- `reps`: `8`, `8-10`, per-set `8-10 | 8-10 | 6-8`, or text (`AMRAP`).
- `rir`: always a range; per-set with `|`; e.g. `1-2 | 1-2 | 0-1` (early sets
  1-2, last set 0-1 — the trainer's real default).
- `load`: `185`, `75%`, or text (`BW`, `BW+25`).
- Mesocycle name comes from the **import form**, not the sheet.

## 5. Data model (key tables)

- `clients`, `client_intake` (75-q intake) — client records.
- `training_blocks` = **Program** (name, style, dates, status).
- `prescribed_workouts` = **planned Day** (`block_id`, `client_id`,
  `prescribed_for`, **`mesocycle`**, `name`, `status`, **`actual_workout_id`**).
- `prescribed_exercises` (targets incl. `rir_low/high`) →
  `prescribed_sets` (per-set `reps_low/high`, `rir_low/high`).
- `workouts` / `workout_exercises` / `workout_sets` = the **actual logged
  session** (`workout_sets`: reps, weight_lbs, rpe, rir, **notes**, is_warmup).
  Logged data is independent of the plan — deleting a plan never deletes it.
- `body_stats`, `goals`, `nutrition_notes`, `sessions`, `client_messages`,
  `login_attempts`.

## 6. Current state / where we left off

- Everything above is **live on production** (`ebab476`) and both migrations
  (0008, 0009) are applied to Neon.
- Andy's "Cut Hypertrophy" program was **cut after Jun 28** (end of week 2).
- The trainer **added the Jun 30 hand-logged session to the program**; it now
  shows its logged sets on the program day (Mesocycle 1 / Week 3).
- **Open trainer action:** add the **Jul 1** hand-logged session to the program
  the same way (open it → "Add to Cut Hypertrophy").

## 7. Lessons / gotchas from this session

1. **Don't trust "the docs" for infra** — verify branch/DB reality (the stale
   handoff docs sent the agent down the wrong branch initially).
2. **Verify migrations really applied** before assuming a feature works (see §2).
3. **Apply SQL before deploying code that reads a new column.**
4. **Read the user's intent carefully** — "Back to working" once got misread as
   "roll back," causing a needless production rollback (immediately restored, no
   data lost). Confirm ambiguous directives.
5. The trainer prefers: concise answers, plain English (avoid jargon), confirm
   direction before building, and ship + verify each change.

## 8. How to work here

- Build on `claude/review-project-docs-byiwx` (or a dev branch you merge into
  it). Every push to it **auto-deploys to the trainer's live app** — so verify
  (`pnpm typecheck && pnpm lint && pnpm test && pnpm build`) before pushing.
- Commit trailers used this session:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` and the
  `Claude-Session:` line.
- For schema changes: edit schema → `pnpm db:generate` → hand the trainer clean
  idempotent SQL (`ADD COLUMN IF NOT EXISTS …`) → they run it in Neon → verify →
  then push.
