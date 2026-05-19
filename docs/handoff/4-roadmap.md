# Trainer Clients — Roadmap & Open Questions

> **The forward-looking document.** What was planned, what's done, what's deferred, what's been explored and rejected, and the open decisions the trainer hasn't made yet. Pair with the Current State doc to know exactly where we are along this roadmap.

---

## Original four-milestone plan

The project was scoped into four milestones from the start. The full plan lives at `/root/.claude/plans/you-are-a-senior-buzzing-steele.md` (a Claude Code plan file from project bootstrap — readable but not in the git repo).

### M1 — Usable MVP today (no workouts yet)

**Status:** ✅ Complete. Live and in use.

**What it included:**
- Next.js 15 + Tailwind + shadcn bootstrap
- Neon Postgres + Drizzle setup (8 initial tables)
- PWA shell with bottom nav, manifest, install banner
- Home screen (`/clients`) with hero next-session card, status row, client list
- Clients CRUD with initials-avatar component (no photos)
- Client detail page with sectioned cards
- Body stats weekly form + list + weight line chart
- Goals (add / toggle / delete)
- Nutrition notes (Markdown append-only)
- Settings page with theme toggle
- Vercel deployed

**Plus everything added beyond the M1 scope:**
- Full 75-question intake form with conditional reveals, multi-select fields, save & resume workflow
- Side-by-side PDF / image / .docx viewer on `/clients/new`
- All the UX hardening (Phases 1–5)
- Loading skeletons + error boundaries
- Keyboard-aware sticky bars
- Body scroll lock on modals

### M2 — Workouts + PRs + Sessions

**Status:** ❌ Not started.

**What it should include:**
- `drizzle/0002_views_prs.sql` migration adding 3 views: `v_set_e1rm`, `v_client_prs`, `v_client_exercise_session_volume`
- `WorkoutEntryForm` (`src/components/workouts/workout-entry-form.tsx`):
  - Reference panel (collapsible textarea for paste-from-sheet text)
  - Accordion exercise cards (one expanded, others collapsed)
  - Exercise autocomplete from past entries (case-insensitive)
  - Pre-fill from previous workout with same exercise
  - Two entry modes per exercise: row-per-set (default), or `3x8@135` shortcut text
  - Auto-save every 2s
  - Large numeric inputs with `inputMode="decimal"`
- Workout list per client + view/edit page
- `/clients/[id]/prs` with PR cards + sparklines
- Sessions CRUD: schedule, list, post-notes, status
- `/stats` cross-client dashboard for overdue logs

**What's already in the DB schema, waiting:**
- `workouts`, `workout_exercises`, `workout_sets`, `sessions` tables all exist with the right columns. No schema work needed for M2 unless the trainer wants additions.

### M3 — CSV import for workouts

**Status:** ❌ Not started; could be moved earlier if useful.

**What it should include:**
- CSV column format documentation
- `papaparse` integration: drag-or-pick CSV → parsed → mapped to `WorkoutEntryForm` state → user reviews/tweaks → save
- Error states for malformed CSVs
- Optional: Google Sheets template to give clients

**Proposed CSV format from the plan:**
```
exercise,set,reps,weight_lbs,rpe,is_warmup
Bench Press,1,8,135,,false
Bench Press,2,8,135,,false
Squat,1,5,225,7,false
```

(Format will need adjustment based on what the trainer's clients' Google Sheets actually export.)

### M4 — Auth (the last thing)

**Status:** ❌ Not started. **Currently paused** mid-discussion (see Current State doc).

**Original plan said: Clerk.** But the trainer's preference has evolved:
- First wanted Supabase auth (familiar)
- Then corrected to **Neon Auth** (so it stays in one vendor)
- Neon Auth is built on **Better Auth**
- Was about to wire it up but pivoted away to feature work

**When resumed, the steps are:**
1. Click "Open quickstart" in the Neon Auth dashboard, screenshot the resulting integration code
2. Install whatever SDK Neon recommends (likely `better-auth` package)
3. Wire server config in `src/lib/auth.ts` or similar
4. Add Better Auth client config
5. Build `/sign-in` page with email/password form (signup happens once for the trainer, then disabled)
6. Add middleware to gate all routes except `/sign-in` and static assets
7. Add app-level email allowlist (trainer's email in an env var) as belt-and-suspenders against the "no restricted signups yet" limitation
8. Add sign-out button on `/settings`
9. (Deferred sub-task) Add `trainer_id` column to every table and filter all queries by `auth().userId` — only needed when adding a second trainer

---

## What's deferred (with rationale)

| Item | Why deferred | Trigger to revisit |
|---|---|---|
| **Auth** | Trainer paused to focus on feature work | Trainer says "let's do auth" |
| **`@serwist/next` service worker** | PWA installs and looks right without it; offline support not needed in v1 | Trainer wants offline mode |
| **`trainer_id` + RLS** | Single-user app | Second trainer joins |
| **Workout photo uploads** | Removed from plan deliberately ("no photos anywhere") | Trainer reverses the decision |
| **Google Sheets API direct sync** | Trainer prefers manual upload-and-paste | Trainer raises it |
| **AI extraction from questionnaire** | Trainer explicitly chose manual entry over AI parsing for privacy | Trainer reverses |
| **Error mapping in `goals.ts`, `body-stats.ts`, `nutrition.ts`, `clients.ts`** | Low impact — they don't surface to UI most of the time | Time available, or one of them actually throws an unhelpful error |
| **`disableWorker: false` on PDF.js** | Current `disableWorker: true` works fine for short PDFs | Trainer reports long-PDF render lag |
| **`/sign-in` page** | Tied to auth deferral | Auth resumes |
| **Loading skeleton heights verified against real pages** | Currently estimates; could shift layout on data load | Slow-network test exposes a problem |
| **Restricted signups workaround** | Better Auth doesn't expose it yet, but Neon says "coming soon" | Either Neon ships it, or we add app-level allowlist |
| **Nutrition note date Drizzle schema fix** | `date("note_date").notNull().defaultNow()` is technically a type mismatch (date column + timestamp default). The action always supplies a date explicitly, so the buggy default never fires | We touch the nutrition table again |
| **Magic links / email sign-in** | Phase after email/password works | Trainer requests |
| **CSV import (full M3)** | Tied to M2 workout entry shipping | M2 ships |

---

## Things we explored and rejected

| Approach | Tried it because | Rejected because |
|---|---|---|
| **PDF.js bare integration** (without react-pdf) | Direct control, fewer deps | Multi-hour debug; canvas rendered blank silently due to pdfjs-dist version mismatch; switched to react-pdf and it worked immediately. |
| **PDF.js worker via `?url` import suffix** | Standard Webpack pattern | Not supported by Next.js's bundler; runtime got an object instead of a string; PDF.js threw "Invalid workerSrc type." Switched to copying worker into `public/` via a postinstall script. |
| **PDF.js worker via CDN** | Bypasses MIME-type issues | Trainer preferred self-hosted. Postinstall copy was the compromise. |
| **iframe PDF viewer** | Native, no JS lib | iOS Safari renders pages at native size with no fit-to-width; trainer would have to two-finger pan to read each page. Hard limit of `<iframe>`. |
| **AI extraction (Claude API)** | Auto-fill the intake form from uploaded PDF | Trainer chose manual entry for privacy; said clients sometimes don't answer everything, so smart parsing was lower value than a "save with whatever I have" flow. |
| **Clerk** for auth | Was in the original plan; battle-tested, fewer integration questions | Trainer wanted to stay in the Neon ecosystem. |
| **Supabase** for auth | Trainer familiar from another app | Would have added a second vendor (Neon for data + Supabase for auth). Switched to Neon Auth. |
| **In-app required-field validation** | Standard UX for important data | Clients don't reliably answer everything; blocked saves; trainer asked to remove. Now only `name` is required. |
| **Bottom nav with Sessions and Stats tabs** | Original plan had 4 tabs | Trainer wanted those as per-client sections inside the detail page, not top-level. Routes deleted, nav simplified to 2 tabs. |
| **`<embed>` vs `<iframe>` for PDF** | First attempt at the viewer | Same fit-to-width issue as iframe; abandoned both for canvas-based react-pdf. |

---

## Open questions the trainer hasn't fully decided

1. **What goes in the per-client info / tracking section?** (This is what the next session will focus on.) The trainer said: *"I am unsure what exactly i want to include in each info section after onboarding each client, or how to go about actually tracking my clients, so i will need your research as a backbone in this phase."* Research-based recommendations are the asked-for output.

2. **How is data collected for remote-only clients?** They obviously can't enter weights live in person. Do they send screenshots, fill a Google Sheet, text the trainer? This affects the workout-entry UX design for M2.

3. **What's the cadence for re-asking intake-style questions?** Some intake fields (medical conditions, sleep, stress) change over time. Should there be a "quarterly reassessment" flow that re-asks a subset of the intake?

4. **Progress tracking visualization preference.** When the trainer looks at a client's progress, do they want: line charts of weight over time? PR-progression cards? A combined dashboard? Side-by-side intake-then vs intake-now comparisons?

5. **Auth provider lock-down strategy.** Neon Auth's "restricted signups" feature is "coming soon." When auth resumes, decide: (a) wait for Neon to ship it, (b) build app-level email allowlist as the lock, (c) both.

6. **Settings page contents.** Currently just theme toggle + version. Eventually should have: sign-out (after auth), data export (CSV dump), maybe a "danger zone" delete-account.

---

## Things to investigate before starting M2 (workouts)

1. **Does the trainer have a sample workout export from a real client's Google Sheet?** That'd nail the CSV format for M3 immediately, and also inform the manual-entry UX (M2).

2. **What exactly is a "workout" in the trainer's mental model?** A whole session at the gym? A program day? A single exercise? The schema assumes one workout = one session (date + multiple exercises + their sets). Confirm.

3. **Do exercises have any global identity** (e.g., should "Bench Press" and "BP" and "bench" all dedupe), or is each text entry independent? The autocomplete pre-fill suggests global identity, but we haven't built the lookup.

4. **Is RPE entered every set or once per exercise?** Schema has it per-set (`workout_sets.rpe numeric(3,1)`). Confirm.

5. **For the PR estimation, Epley vs Brzycki?** The plan documented Epley (`w × (1 + r/30)`). Confirm before building. PR display always shows `(est.)` to flag the approximation.

---

## Decisions already made (don't relitigate)

- **No photo uploads anywhere.** Initials avatars only. Confirmed multiple times.
- **No client login.** Only the trainer authenticates. Clients send info via the questionnaire PDF + (later) Google Sheets exports.
- **No client portal.** Out of scope for v1.
- **No notifications / push.** Out of scope for v1.
- **Bottom nav has 2 tabs only.** Clients + Settings.
- **`/sessions` and `/stats` are not top-level routes.** They live inside the client detail page.
- **Drizzle, not Prisma.** TypeScript-first, lighter, plays well with Neon HTTP driver.
- **Neon, not Supabase, for the database.** Decided after Supabase free-tier project caps got in the way.
- **Tailwind + shadcn primitives, not a heavier UI library.**
- **react-hook-form + Zod, not formik.**
- **Mammoth for .docx and react-pdf for PDFs.** Confirmed working.
- **Required validation almost entirely removed.** Only `name` is required to save.
- **Save Client / Save changes button (not "Submit" / "Create").** Reflects the partial-save mental model.

---

## Long-term ideas (someday, maybe)

These are not on the roadmap but the trainer has hinted at them. Capture so they're not forgotten.

- **Weekly digest email to the trainer**: "These 3 clients haven't logged a workout in 7+ days."
- **Quarterly intake reassessment flow**: re-ask a subset of questions automatically.
- **Per-client structured "process and plan" doc**: the trainer mentioned wanting to build out the plan for each customer after onboarding. Format TBD.
- **Per-client measurement progression view**: waist / chest / hips trends, not just weight.
- **Lift PR sparklines**: tiny line charts on the PR cards.
- **Goals with milestones**: split a goal into sub-targets.
- **Nutrition tracking with macros**: currently just free-form Markdown notes; could add structured macros later if it becomes a real need.
- **Backup / export**: weekly CSV dump of all tables.

---

## Risks the trainer should be aware of

1. **No auth.** The Vercel URL is publicly accessible. Anyone who knows or guesses it can CRUD client data. Mitigations: don't share the URL publicly, prioritize getting M4 done.

2. **No backups beyond Neon's 24-hour PITR.** No scheduled exports. Worth adding before client data becomes critical.

3. **No `trainer_id` scoping.** If a second user ever signs in (post-auth), they'd see all clients. Adding the column scoping is straightforward but takes touching every query.

4. **react-pdf / pdfjs-dist version coupling is fragile.** Any future upgrade of react-pdf needs immediate verification that pdfjs-dist is on the matching version.

5. **iOS PWA storage purge after ~7 days unused.** Real data lives in Neon, so the worst case is having to sign in again (post-M4). Not a data-loss risk.

6. **Loading skeleton heights are estimates.** On slow networks, when real data lands, the layout might shift visibly. Hasn't been observed yet but flagged in an earlier audit.

7. **Server-action error mapping is incomplete.** Only `intake.ts` maps raw DB exceptions to user-friendly strings. If `goals.ts`, `body-stats.ts`, `nutrition.ts`, or `clients.ts` ever throw, the user sees the raw error via `(app)/error.tsx`. Low-impact but should be fixed eventually.

---

## "If you only have 15 minutes to absorb this app" priority

1. Read **Project Overview** (handoff-1) — knows the stack, design system, and architectural decisions.
2. Open `src/db/schema.ts` — knows the data model.
3. Read `src/lib/schemas/client-intake.ts` — knows the intake form's shape and validation rules.
4. Read `src/components/intake/intake-form.tsx` and one or two `sections/section-*.tsx` files — knows how the form is composed.
5. Read **Current State** (handoff-2) section "Where we paused" — knows what's next.
