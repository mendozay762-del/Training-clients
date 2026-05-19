# Trainer Clients — Development Workflow

> **How work gets done on this project.** Git practices, deployment pipeline, database migration flow, environment variables, scripts, testing/verification, and the user's working-style preferences. Read alongside Project Overview and Current State.

---

## Git workflow

- **Only ever work on `claude/trainer-pwa-setup-gLrMY`.** There is no `main`. This single branch IS the Vercel production branch.
- **No PRs.** Direct commits to the branch.
- **Push triggers Vercel deploy.** Every `git push origin claude/trainer-pwa-setup-gLrMY` immediately starts a production build on Vercel. There is no preview branch.
- **Therefore: stage changes locally, verify thoroughly, push only when the user says so.** This is one of the trainer's strongest preferences (explicit phrase: "extreme precision, we cannot afford to have anymore mistakes").
- **Commits are detailed.** Multi-paragraph commit messages explaining the *why* of each change. See recent git log for the style.
- **No `--no-verify`, no `--force` pushes**, no rewriting published history. The trainer is non-technical; surprises in their repo would be confusing.

---

## Development environment

The trainer's primary development surface is **Claude Code on the web** (claude.ai/code) running against this repo. The Claude Code execution environment:
- Is a fresh container, recreated each session.
- Has the repo cloned to `/home/user/Training-clients`.
- Has `pnpm`, `node`, `git`, `tsc`, `next` all preinstalled.
- Has outbound network configured for `npmjs.com`, `github.com`, etc. — but **blocks `neon.tech`** (returns HTTP 403). This is the single biggest workflow constraint.
- Persists nothing between sessions. Anything not committed to git is lost.

---

## Database & migrations (the constraint that shapes everything)

### Why migrations are weird here

In a normal project you'd:
1. Edit `src/db/schema.ts`
2. Run `pnpm db:generate` to produce SQL
3. Run `pnpm db:push` to apply directly to the database

**Step 3 doesn't work from inside the Claude Code environment** because outbound traffic to `*.neon.tech` is blocked. Symptoms: `db:push` hangs forever, or throws "Unexpected server response: 403," or a WebSocket upgrade error.

### Therefore the actual workflow

1. **Locally:** edit `src/db/schema.ts`.
2. **Locally:** `pnpm db:generate` — produces a new SQL file in `drizzle/000X_<name>.sql` plus updates `drizzle/meta/`.
3. **Read the generated SQL file** to verify it's what you expected.
4. **Clean it up slightly for paste-ability:** drizzle inserts `--> statement-breakpoint` markers between statements. These are valid Postgres line comments (since `--` starts a comment) so the SQL works as-is, but for migrations that include `USING CASE WHEN ... THEN ... ELSE ARRAY[...] END` clauses (needed when changing column types on existing data), drizzle's auto-generated version uses bare `SET DATA TYPE` which fails on non-empty tables — you have to manually add the `USING` clauses.
5. **Paste the SQL into Neon's SQL Editor** (https://console.neon.tech → your project → SQL Editor → paste → Run). Confirm with the user the expected number of success messages.
6. **Commit the schema.ts change + the generated drizzle/ files together.**

### Migrations applied so far

| File | Purpose | When |
|---|---|---|
| `drizzle/0000_dapper_wildside.sql` | Initial 8-table schema (clients, workouts, workout_exercises, workout_sets, body_stats, sessions, goals, nutrition_notes) | Project bootstrap |
| `drizzle/0001_curious_mojo.sql` | New `client_intake` table (~76 nullable columns), `clients` gets 13 new columns, `body_stats` gets 3 new measurement columns | Intake-form milestone |
| `drizzle/0002_broad_excalibur.sql` | Convert 7 columns to arrays: `gym_access`, `days_per_week`, `session_length_min`, `split_preference`, `work_activity`, `dietary_pattern` on `client_intake`; `comm_preference` on `clients` | Multi-select milestone |

Each was pasted by the trainer into Neon's SQL Editor and the trainer confirmed "done" before I pushed the code that depended on the new schema.

---

## Environment variables

### Local (`.env.local`, gitignored)

```
DATABASE_URL=postgresql://neondb_owner:<password>@<endpoint>.us-east-1.aws.neon.tech/neondb?sslmode=require
```

Only one variable currently. When auth gets added, expect 2–3 more (Neon Auth project ID + keys, or similar depending on the integration we land on).

### Vercel (Project Settings → Environment Variables)

`DATABASE_URL` is the only configured variable. It must be enabled for **Production**, **Preview**, and **Development** (was the source of an early bug: it was originally only set for Preview, so Production couldn't connect).

The variable name was once typo'd as `Database_URL` (mixed case). Postgres env var names are case-sensitive — `process.env.DATABASE_URL` is undefined if the variable is named `Database_URL`. Don't repeat this.

### What's NOT in version control

- `.env.local` — gitignored.
- `public/pdf.worker.min.mjs` — gitignored; regenerated by postinstall + prebuild.

---

## Scripts (`package.json`)

```
"dev":         "next dev --turbopack"            # local dev server, hot reload
"build":       "next build"                       # production build (used by Vercel)
"start":       "next start"                       # serve production build
"lint":        "next lint"                        # ESLint; warns about deprecation but still works
"typecheck":   "tsc --noEmit"                     # type-only check
"db:generate": "drizzle-kit generate"             # produces SQL from schema diff
"db:push":     "drizzle-kit push"                 # DOESN'T WORK in Claude env — see Migration section
"db:studio":   "drizzle-kit studio"               # local DB GUI; can be useful when developing locally on a machine that CAN reach Neon
"postinstall": "node scripts/copy-pdf-worker.mjs" # copies pdfjs-dist worker to public/
"prebuild":    "node scripts/copy-pdf-worker.mjs" # same; runs before next build
```

---

## Verification workflow (the user expects this every time)

Before committing or pushing anything, the standard sequence is:

```bash
pnpm typecheck            # tsc --noEmit; should be silent
pnpm lint                 # next lint; should report no warnings or errors
rm -rf .next              # clear Next.js cache so stale generated types don't lie
DATABASE_URL=postgresql://placeholder pnpm build   # production build with a placeholder URL since we don't need to connect at build time (DB client is lazy)
```

For substantial changes, also dispatch a **verification agent** (Explore subagent type) with a prompt that asks it to:
- `git show <hash>` or `git diff origin/<branch>..HEAD -- <path>` against the local commits
- Verify the claims in the commit messages
- Look for regressions, missed cases, inconsistencies
- Report Critical / High / Medium / Notes

I then **critically evaluate the agent's findings** rather than accepting them blindly. Past agents have produced "Critical" false positives (e.g., "infinite loop in useEffect" that's actually safe due to a guard, "scroll-lock race condition" between two modals on different routes that can never simultaneously mount). When dismissing an agent finding, explain the reasoning to the user so they trust the call.

If any verification step fails, fix and re-run. Don't push broken code.

---

## How the user expects me to behave

This is captured from many turns of feedback. Treat as durable preferences.

### Response style

- **Short, scannable replies.** "Two to three sentences per section maximum" was an explicit instruction. Use tables for inventory lists. Use bold for important phrases. Avoid bulleted lists when prose works.
- **No emojis** unless the user uses them first.
- **Match the user's energy.** When they're frustrated (mid-debug, multiple failed pushes), drop into honest assessment mode — admit what's not working, propose a clean path forward, ask if they want to continue or abandon.
- **Don't narrate internal deliberation.** State results and decisions directly.
- **End turns with a clear next action**, usually one of: "tell me when done" / "approve and I'll execute" / "say push when ready."

### Decision points

- **Use AskUserQuestion for binary / multi-choice decisions** (recommendation as first option, "(Recommended)" suffix when there's a clear best). Don't ask plan-approval questions via AskUserQuestion — for that use ExitPlanMode if in plan mode, or just present and wait.
- **Never push without explicit "push" instruction** unless the user has explicitly authorized auto-push for a window (rare).
- **Stage commits locally** — `git commit` is fine; `git push` requires permission.

### Risk handling

- The user values **precision over speed.** Even though they want this for clients ASAP, they'll happily wait an extra 5 minutes to verify before deploy.
- When something breaks in production, **don't immediately push a fix** — diagnose, propose, get approval. The pattern is: receive screenshot of bug → diagnose → propose fix → get approval → execute → verify → ask permission to push.
- **When agents report critical findings, push back if they're wrong.** Don't accept verification reports uncritically.
- **`pnpm audit` is run after dependency upgrades.** Vercel's auto-CVE-fix bot is unreliable — once it shipped a partial fix that left 21 vulnerabilities including a critical auth bypass. The handoff doc (in `/home/user/claude-handoff-modern-stack.md`, given to the trainer earlier) emphasizes this.

### Communication patterns

- The user often **uploads screenshots from iPad Safari** as their primary debugging surface. Read the screenshot carefully — the UI state in it is the ground truth.
- The user sometimes **types in shorthand or with typos** (e.g., "vase button" for "save button"). Interpret charitably and confirm.
- The user **frequently doesn't know the exact technical term** for what they want. Ask clarifying questions; don't guess.
- The user **prefers multi-choice questions for ambiguous decisions** (AskUserQuestion with 3 options, recommended first, was a pattern they explicitly liked).

### What to NOT do

- **Don't suggest adding features** they didn't ask for.
- **Don't commit / push during plan-mode discussions.** Plan mode is for proposals only.
- **Don't introduce new dependencies without flagging.** Bundle size matters. The trainer has a working app and doesn't want bloat.
- **Don't refactor unrelated code.** Stay scoped to what's asked.
- **Don't write comments in code** unless the *why* is non-obvious. The current codebase has very few comments and the trainer prefers it that way.
- **Don't create new docs** (.md files in the repo) unless explicitly asked.

---

## Common operations cheat sheet

### Apply a schema change

1. Edit `src/db/schema.ts`
2. `pnpm db:generate` → check `drizzle/000X_*.sql`
3. Paste cleaned SQL in chat for user to run in Neon
4. Wait for user to confirm "done"
5. Commit the schema + generated migration files
6. Then push code that uses the new columns

### Build a new server action

1. Add to `src/lib/actions/<resource>.ts`
2. Use the established `{ ok: true, ... } | { ok: false, error: string }` shape
3. Validate input with Zod schema from `src/lib/schemas/`
4. Use `try/catch` around DB calls; map raw exceptions to user-friendly text in the `error` field; `console.error` the raw exception
5. Call `revalidatePath()` for any routes that read the affected data

### Add a new form field

1. Update the Zod schema (`src/lib/schemas/client-intake.ts` or similar)
2. Update the DB schema (`src/db/schema.ts`) + run migration
3. Update the form section component (`src/components/intake/sections/section-X-*.tsx`)
4. Update the server action's column-mapping helper (`clientValuesFromForm` / `intakeValuesFromForm` in `src/lib/actions/intake.ts`)
5. If it's edit-supported: update `formDefaultsFromDb` in `src/lib/intake-defaults.ts`

### Add a new route

1. Create the page at `src/app/(app)/<segment>/page.tsx`
2. Decide static or dynamic. If reading DB, add `export const dynamic = "force-dynamic"`.
3. Add `loading.tsx` skeleton (use `src/components/skeleton.tsx`)
4. If this route should hide the bottom nav (focused flow), add the path or suffix to `HIDDEN_PATHS` / `HIDDEN_PATH_SUFFIXES` in `src/components/nav/bottom-nav.tsx`
5. Use `PageHeader` for the top bar with optional back arrow + actions

### Test something on the deployed site

1. `git push -u origin claude/trainer-pwa-setup-gLrMY`
2. Wait ~90 seconds for Vercel to redeploy
3. User opens the production URL on iPad / iPhone and reports back
4. If broken: receive screenshot → diagnose → fix → repeat

---

## Tools available to me in Claude Code

- **Bash** for git, pnpm, file ops, build verification.
- **Read / Edit / Write** for files in the repo.
- **Agent** with `Explore` subagent type for read-only audits / verification.
- **AskUserQuestion** for multi-choice decisions.
- **GitHub MCP** tools (under `mcp__github__*`) for GitHub-side operations like reading PR comments, creating PRs, etc. Available but rarely needed since we don't use PRs.
- **SendUserFile** for delivering files to the user (e.g., the handoff docs themselves).

---

## When I'm stuck

The trainer is patient when I admit I don't know something. The pattern that works:

1. State what I observed (the failure mode).
2. State what I tried.
3. State a hypothesis.
4. Propose either: a deeper diagnostic step, an alternative approach, or "let's abandon this and use [native alternative]."
5. Ask for direction.

This is how we navigated:
- The Neon Auth dashboard being different from what I remembered (asked for screenshot, then re-grounded).
- The PDF.js blank-rendering bug (proposed 3 approaches, asked permission to try react-pdf, then succeeded by also pinning pdfjs-dist).
- The pinch-zoom listener churn (admitted my deps array was fragile, fixed via ref).

When verification agents return reports with "Critical" findings, evaluate them with the same skepticism. Past agents have over-called severity.
