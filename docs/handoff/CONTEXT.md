# CONTEXT — Full Handoff (Trainer Clients) · 2026-07-03

> **The next chat should read this top to bottom before doing anything.** It
> contains everything from the previous chat needed to continue seamlessly.
> Older docs in `docs/handoff/1-*.md … 4-*.md` are **STALE** — trust THIS file.
> Companion file: **`docs/handoff/CSV-FORMAT.md`** (the program CSV spec).

---

## 0. How to resume (do this first)

- **Repo:** `mendozay762-del/training-clients`
- **Working branch = `claude/review-project-docs-byiwx`** — this is Vercel's
  **production** branch; **pushing to it auto-deploys the trainer's live app.**
  `claude/vigilant-hawking-zOQtT` is an identical mirror.
- **Live URL:** `training-clients.vercel.app`

```bash
git fetch origin
git checkout claude/review-project-docs-byiwx
git pull origin claude/review-project-docs-byiwx
git log --oneline -1        # confirm you're at the latest handoff commit
pnpm install
pnpm typecheck && pnpm lint && pnpm test   # sanity
```

**Paste-ready first message for the new chat:**

> Work in `mendozay762-del/training-clients` on branch
> `claude/review-project-docs-byiwx` (production — auto-deploys on push). First
> run `git fetch origin && git checkout claude/review-project-docs-byiwx && git
> pull`, then read `docs/handoff/CONTEXT.md` and `docs/handoff/CSV-FORMAT.md` in
> full and confirm the latest commit. We're continuing from there. [then say
> what you want next]

---

## 1. TL;DR of the whole previous chat

We reviewed the trainer's business docs and the **Trainer Clients** webapp, then
**shipped 6 features to the live app** and applied **2 database migrations**.
Everything is live. The one open action on the trainer's side: **add the Jul 1
hand-logged session to the program** (same "Add to program" flow used for Jun 30).

Session commits (newest first), on top of `488373b`:

| Commit | What |
|---|---|
| `f759a9b` | docs: session handoff |
| `ebab476` | **Show the logged session's sets/reps on a program day** |
| `62b3080` | **"Add to program" button for hand-logged sessions** |
| `0a5e4b3` | **Protect logged days across every delete path** (code-review fixes) |
| `8d568df` | **Mesocycles within a program** (migration **0009**) |
| `d3541bd` | **Bulk-delete planned days** — "Delete week" + "Cut from here" |
| `2d63fd9` | **Per-set RIR/rep targets, set notes, weight-first entry** (migration **0008**) |

---

## 2. Project & business background

- **Trainer Clients** — a private **Next.js 15 PWA** for one solo personal
  trainer (**Yamil**) to manage a handful of clients (1–5). Clients never log
  in; the trainer is the only user (there is a login gate + `login_attempts`).
- **Purpose:** replace spreadsheets/PDFs — store client intake, write training
  **programs**, and **log actual sessions** (sets/reps/weight/RIR) against them.
- **Primary client in play:** **Andy** (paying client). His program is a
  training block named **"Cut Hypertrophy."**
- The trainer authors programs in an external **PDF-builder web app** that emits
  a **CSV**, which he pastes into this app's **import** box. That CSV format is
  the subject of `docs/handoff/CSV-FORMAT.md`.

**Stack:** Next.js 15 (App Router, React Server Components + Server Actions),
TypeScript (strict), Tailwind + shadcn-style primitives, **Drizzle ORM** on
**Neon Postgres**, deployed on **Vercel**. Tests: **vitest**. Package manager:
**pnpm**. Schema lives in `src/db/schema.ts`; queries in `src/lib/queries/`;
server actions in `src/lib/actions/`.

---

## 3. Infrastructure & critical facts (these caused real pain — internalize)

1. **Production branch = `claude/review-project-docs-byiwx`.** Vercel deploys it
   on push. (A stale handoff doc claims `trainer-pwa-setup` — that is WRONG. At
   the start of this session the agent was on a stale branch and had to correct
   to the real one.)
2. **Database = Neon**, project **"Trainer Clients"**, branch **`production`**,
   database **`neondb`**, via `DATABASE_URL`.
3. **This container/agent CANNOT reach Neon** (network policy). So **schema
   migrations are applied by hand:** edit `src/db/schema.ts` → `pnpm db:generate`
   → hand the trainer the SQL → **he pastes it into Neon's web SQL Editor**
   (branch `production`, db `neondb`).
4. **Always make migration SQL idempotent** (`ADD COLUMN IF NOT EXISTS …`,
   `CREATE TABLE IF NOT EXISTS …`) and **verify it actually applied** — do not
   trust a green "success" toast. Verify by either checking Vercel runtime
   errors for `column … does not exist`, or having the trainer run
   `SELECT column_name FROM information_schema.columns WHERE table_name='…' AND
   column_name='…';` and confirm a row returns. **Migration 0009 silently
   failed once this session and broke the live app**; a clean re-run fixed it.
5. **Order of operations for schema changes: apply the SQL BEFORE deploying code
   that reads the new column/table**, or the page crashes with
   `column does not exist`.
6. **Verify deploys/errors** from the agent with the **Vercel MCP** tools
   (`list_deployments`, `get_runtime_errors`, `get_deployment_build_logs`).
   They're occasionally flaky — retry; don't block on them.
7. **Every push to the production branch is live to the real client.** Run
   `pnpm typecheck && pnpm lint && pnpm test && pnpm build` before pushing.

---

## 4. What happened this session, in order (the narrative)

1. **Branch correction.** Found the agent on a stale branch; moved to the real
   production branch (`review-project-docs-byiwx`, then at `488373b`).
2. **Per-set RIR/reps feature** (`2d63fd9`, migration **0008**). Added a
   `prescribed_sets` table (per-set `reps_low/high/text`, `rir_low/high`),
   `rir_low/rir_high` on `prescribed_exercises`, and `notes` on `workout_sets`.
   The importer learned per-set values split by `|` and RIR ranges. During live
   logging, each set row shows the prescribed **rep range + RIR** as a faint
   target above the box; set-row order became **weight → reps → RPE → RIR**.
3. **Program-structure discussion → mesocycles.** Agreed the model is
   **Program → Mesocycle → Week → Day**, mesocycles can be any length (4–6 wks),
   and the trainer **builds one mesocycle at a time** (autoregulation) under one
   persistent Program.
4. **Bulk-delete tools** (`d3541bd`): "Delete week" and "Cut from here ↓" on the
   program page, filtering out logged days.
5. **Mesocycles** (`8d568df`, migration **0009**): added
   `prescribed_workouts.mesocycle` (text, backfilled `'Mesocycle 1'`); program
   view groups Mesocycle → Week → Day with weeks numbered **within** each
   mesocycle; mesocycle name is entered in the **import form**, not the CSV.
6. **Code review → logged-day protection everywhere** (`0a5e4b3`): the import's
   "replace existing" and single-day delete now also skip logged days; single
   delete is block-scoped; the delete button is hidden on a logged day.
7. **Migration friction + a mistake to learn from.** Migration 0009 didn't take
   the first time; the live app threw `column "mesocycle" does not exist`. During
   troubleshooting the agent **misread the trainer's "Back to working" as a
   rollback request** and force-pushed production back a commit, then
   **immediately restored** it when the trainer clarified (no data lost). The
   trainer re-ran clean SQL, the column applied, app recovered. **Lesson:
   confirm ambiguous directives before acting; verify migrations.**
8. **"Add to program"** (`62b3080`): a hand-logged session (not started from the
   program) shows an "Add to program" button; it links to a planned day on that
   date if one exists, else creates a completed day in the right mesocycle/week.
9. **Logged data on the program day** (`ebab476`): a program day linked to a
   logged session now shows the real sets (weight × reps · RIR/RPE, per-set
   notes), so hand-added days aren't blank.
10. **Handoff + CSV deliverables** (`f759a9b` + this file).

---

## 5. Features in detail (what to know to extend them)

### 5.1 Per-set RIR / reps (`2d63fd9`, migration 0008)
- **Schema:** `prescribed_sets` (FK `prescribed_exercise_id`, `set_index`,
  `reps_low/high/text`, `rir_low/high`); `prescribed_exercises.rir_low/high`;
  `workout_sets.notes`.
- **Import:** a `reps`/`rir` cell may hold per-set tokens split by ` | ` (count
  must equal `sets`); a single token broadcasts to all sets. RIR is a range
  (e.g. `1-2`).
- **Live logging** (`getWorkoutDetail` + set-row UI): shows the prescribed rep
  range + RIR as a **faint target above each box**, matching the workout's
  exercise to the linked prescription by order then name. Row order:
  **weight → reps → RPE → RIR**. Per-set note affordance on each row.
- **Important:** these faint targets appear only when the session was **started
  from the program** (so it's linked via `prescribed_workouts.actual_workout_id`).

### 5.2 Bulk-delete (`d3541bd`)
- Program (block) page: each week header has **"Delete week"** and
  **"Cut from here ↓"** (this week + all later). Both **never delete logged
  days** (`isNull(actual_workout_id)`).

### 5.3 Mesocycles (`8d568df`, migration 0009)
- `prescribed_workouts.mesocycle` (text). Program groups **Mesocycle → Week →
  Day**; weeks numbered within each mesocycle → mesocycles can be any length.
- **Mesocycle name is set once in the import form** (pre-fills next, e.g.
  "Mesocycle 2"); each import = one mesocycle. NOT a CSV column.

### 5.4 Logged-day protection (`0a5e4b3`)
- Import "replace existing", single-day delete, and the bulk deletes all skip
  logged days; delete UI hidden on a logged day's page. Logged data is sacred —
  deleting a plan never destroys a performed session.

### 5.5 "Add to program" (`62b3080`)
- On a hand-logged session's page, shown **only when it isn't in a program**
  (`inProgram` from `getWorkoutDetail` = whether any `prescribed_workouts` row
  has `actual_workout_id = workout.id`).
- Action `addWorkoutToProgram(workoutId, clientId, blockId)`: if a **planned
  (unlinked) day exists on that date** → link it (mark completed); else
  **create a completed day** on that date, assigning the mesocycle of the latest
  day on/before that date. Multiple programs → picker; one → auto.

### 5.6 Logged session on the program day (`ebab476`)
- `getPrescribedWorkoutDetail` now returns `logged` (the linked workout's
  exercises + sets). The prescribed-day page renders a **"Logged session"**
  section (weight × reps · RIR/RPE, per-set notes); the empty "Plan" box is
  hidden when there are no prescribed exercises.

---

## 6. Program / mesocycle model

**Hierarchy: Program → Mesocycle → Week → Day → Exercise → Set.**
- **Program** = `training_blocks` (persistent, e.g. "Cut Hypertrophy").
- **Mesocycle** = the `mesocycle` label on each day; a phase (4–6 wks), built one
  at a time.
- **Week** = derived from dates, numbered within the mesocycle.
- **Day** = `prescribed_workouts` (has `mesocycle`, `prescribed_for`, `status`,
  `actual_workout_id`).
- **Exercise/Set** = `prescribed_exercises` / `prescribed_sets` (the plan) vs
  `workout_exercises` / `workout_sets` (the actual logged session).

Full model rationale was also delivered as `trainer-clients-program-model.md`.

---

## 7. Data model (key tables)

- `clients`, `client_intake` (75-question intake).
- `training_blocks` = **Program**.
- `prescribed_workouts` = planned **Day** (`block_id`, `client_id`,
  `prescribed_for`, **`mesocycle`**, `name`, `status`, **`actual_workout_id`**).
- `prescribed_exercises` (targets incl. `rir_low/high`) → `prescribed_sets`
  (per-set `reps_low/high`, `rir_low/high`).
- `workouts` / `workout_exercises` / `workout_sets` = the **actual logged
  session** (`workout_sets`: reps, weight_lbs, rpe, rir, **notes**, is_warmup).
- `body_stats`, `goals`, `nutrition_notes`, `sessions`, `client_messages`,
  `login_attempts`.
- Migrations live in `drizzle/` (latest applied: **0008**, **0009**).

---

## 8. CSV import format (summary — full spec in `CSV-FORMAT.md`)

Header (exact order):
`prescribed_for,workout_name,exercise_name,sets,reps,load,rpe,rir,notes`
- One row per exercise; rows sharing `prescribed_for` + `workout_name` = one day.
- `rir` is **always a range**, **per set**, split by ` | ` (token count = `sets`);
  trainer's default: early sets `1-2`, last set `0-1`.
- `reps`: number / range / per-set with ` | ` / text. `load`: `185`, `75%`, or
  text (`BW+25`). `rpe`: left blank (he programs by RIR). No commas inside cells.
- **Mesocycle name is typed into the import box, not the CSV.**

A full 4-week worked example was delivered as `andy-4-week-upper-lower.csv`.

---

## 9. Current live state & open items

- **Live at the latest handoff commit; migrations 0008 + 0009 applied.**
- Andy's "Cut Hypertrophy" was **cut after Jun 28** (end of week 2). The trainer
  **added Jun 30** (hand-logged) to the program — it shows its logged sets in
  Mesocycle 1 / Week 3.
- **OPEN (trainer action):** add the **Jul 1** hand-logged session to the program
  (open it → "Add to Cut Hypertrophy").
- No known bugs open. No PRs open (work pushed straight to the prod branch).

---

## 10. Lessons / working style

1. **Verify infra reality** (branch, DB) — don't trust the old docs.
2. **Verify migrations really applied**; **apply SQL before deploying** code that
   reads it.
3. **Confirm ambiguous directives** before acting (the "Back to working" misread
   caused a needless rollback — instantly reversed, but avoidable).
4. **The trainer prefers:** concise answers, plain English (define jargon),
   confirm direction before building, ship + verify each change, one consult then
   build.
5. **Verify before every push** (typecheck/lint/test/build) — pushes are live.
6. Commit trailers used: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
   and a `Claude-Session:` line.

---

## 11. Deliverables produced this chat

- `docs/handoff/CONTEXT.md` (this file) — full context handoff.
- `docs/handoff/CSV-FORMAT.md` — CSV spec + design rationale.
- `docs/handoff/2026-07-03-session-handoff.md` — earlier (shorter) handoff.
- `program-sheet-format.md`, `trainer-clients-program-model.md`,
  `andy-4-week-upper-lower.csv` — delivered to the trainer as files (for the
  PDF-builder chat); not required reading to continue coding.
