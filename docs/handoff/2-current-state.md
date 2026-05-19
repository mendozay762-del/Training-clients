# Trainer Clients — Current State & Where We Left Off

> **This is the "what's live right now and what we were just doing" document.** Pair it with the Project Overview and Development Workflow docs for full context.

---

## Deployment status

- **GitHub repo:** `mendozay762-del/training-clients` (note: GitHub uses lowercase `training-clients`; local repo is `Training-clients`)
- **Active development branch:** `claude/trainer-pwa-setup-gLrMY` — this is also Vercel's **Production** branch (not `main`; `main` doesn't exist in this repo)
- **Vercel project name:** `training-clients`
- **Latest deployed commit:** `71f0a62` — Phase 5 (resume-intake workflow). Pushed during this conversation. Build was clean.
- **Vercel production URL pattern:** `training-clients-<hash>-mendozay762-dels-projects.vercel.app`. The hash changes on each deploy; the trainer has been pinning the most recent one in their Safari tabs.
- **Database (Neon):**
  - Project: `Trainer Clients`, region `us-east-1`, branch `production`, database `neondb`
  - Connection string lives in `DATABASE_URL` env var (locally in `.env.local`, on Vercel in env settings)
  - Schema has had **three migrations applied** via Neon's web SQL Editor (we cannot run `pnpm db:push` from inside the Claude Code execution environment — outbound traffic to `neon.tech` is blocked by the environment's network policy. See Workflow doc.)

---

## Everything that's implemented and working

### Routing structure

| Route | Status | Notes |
|---|---|---|
| `/` | ✅ working | Redirects to `/clients` |
| `/clients` | ✅ working | Client list, hero card for next session, "+ New" button. Has `loading.tsx` skeleton. |
| `/clients/new` | ✅ working | Full 75-question intake form + side-by-side PDF viewer. Bottom nav hidden here. |
| `/clients/[id]` | ✅ working | Client detail with sectioned cards (workouts/goals/sessions/nutrition placeholders + body stats summary). Has `loading.tsx`. Header has two action buttons: ClipboardList (intake edit) + Pencil (basic edit). |
| `/clients/[id]/edit` | ✅ working | Basic info edit (name / email / phone / etc.) |
| `/clients/[id]/intake/edit` | ✅ working | Full intake form, pre-filled, for resuming/editing. Bottom nav hidden. |
| `/clients/[id]/goals` | ✅ working | Add / toggle done / delete goals. |
| `/clients/[id]/nutrition` | ✅ working | Append-only Markdown notes. |
| `/clients/[id]/stats` | ✅ working | Body stats list + weight chart. Has `loading.tsx`. |
| `/settings` | ✅ working | Theme toggle, version. |
| `/clients/[id]/workouts/*` | ❌ NOT BUILT | M2 milestone. |
| `/sessions` | 🚫 REMOVED | Was scaffolded then deleted per trainer's request. Sessions are now a section inside client detail. |
| `/stats` | 🚫 REMOVED | Same — became per-client body stats only. |

### Database schema (9 tables, in `src/db/schema.ts`)

| Table | Purpose | Notes |
|---|---|---|
| `clients` | Top-level client record | 21 columns including identity (name, dob, contact), location (city/state/address), `coaching_type` (in_person / remote / hybrid), `comm_preference` as `text[]` (multi-select), referral, budget, active flag |
| `client_intake` | One row per client; all 75 questionnaire answers (~76 columns) | `gym_access`, `days_per_week`, `session_length_min`, `split_preference`, `work_activity`, `dietary_pattern`, `measure_progress` are all arrays (text[] or integer[]). All other columns nullable. Acknowledgment captured as a single `acknowledged_at` timestamp + `acknowledged_name` text. |
| `body_stats` | Weekly check-ins | Has `weight_lbs`, `sleep_hours_avg`, `wellness` 1-10, plus `waist_in`, `chest_in`, `hips_in` added for intake-time measurements. Unique on (client_id, week_start). |
| `goals` | Free-form goals with optional target date + done toggle | |
| `nutrition_notes` | Append-only Markdown notes per client | |
| `sessions` | Scheduled appointments | Not yet exposed in UI; schema present for M2. |
| `workouts` | One per session: date + notes | M2. |
| `workout_exercises` | Ordered list within a workout | M2. |
| `workout_sets` | One per set: reps, weight, RPE, warmup flag | M2. |

### Intake form behaviors (the most complex feature)

- **All 75 questions wired**, grouped into 9 sections (+ acknowledgment).
- **Conditional reveals**: address shows only for in-person/hybrid; gym-access / equipment for remote/hybrid; currently-training follow-ups show on Yes; trainer-history questions show on Yes; lift weights (squat/bench/dl/ohp/row) show for 1+ year experience; the entire Section 5 hides for <1 year experience.
- **Multi-select on 7 questions**: gym access, days/week, session length, comm preference, training split, work activity, dietary pattern. (Q27 measure progress was always multi.)
- **Only `name` is required**. All other formerly-required fields (DOB, emergency contact, PAR-Q answers, acknowledgments) are now optional. The trainer can save partial info and resume later.
- **PAR-Q amber notice**: if any of the 7 PAR-Q questions is answered "Yes," an amber notice appears reminding the trainer that doctor's clearance is recommended. Does NOT block submit.
- **Save & resume**: hitting **Save Client** on `/clients/new` creates the client with whatever's filled in and redirects to the detail page. The ClipboardList icon in the detail page's header (top-right, next to the Pencil) takes you to `/clients/[id]/intake/edit` where every previously-entered answer is pre-filled. Submit button there reads **Save changes**.
- **Sticky submit bar** uses `useKeyboardInset` hook to float above the iOS keyboard / autofill accessory bar.

### Side-by-side questionnaire viewer

- **Layout:** on iPad / desktop (≥768 px) the form sits left at ~60%, the viewer sticks right at ~40%. On phone (<768 px), the viewer collapses into a floating **"View questionnaire"** button at the top of the form; tapping it opens a full-screen overlay with safe-area padding.
- **Privacy:** file lives only in browser memory (object URLs + mammoth-converted HTML). Evaporates on tab close, refresh, or navigation away. No server upload, no localStorage. Body scroll is locked when the overlay is open.
- **Supported formats:**
  - **PDF** — react-pdf renders all pages continuously stacked, fit-to-width, with a floating "X of Y" page indicator that fades 1.5 s after scroll. Zoom button toggles pinch-to-zoom (1.0–3.0×) via custom Pointer Events. Rotate button cycles 0/90/180/270.
  - **Image** — `<img object-contain>`.
  - **`.docx`** — converted to HTML in-browser via mammoth (dynamic-imported, ~150 KB on demand).
- **Error path:** if rendering fails, a red "Remove file" button replaces the viewer body — clears the file and returns to the drop zone.
- **Worker setup:** `pdfjs-dist@5.4.296` is pinned (matches react-pdf 10.4.1). Worker file copied to `public/pdf.worker.min.mjs` via `scripts/copy-pdf-worker.mjs` (postinstall + prebuild). Worker is currently *disabled* on the renderer side (`disableWorker: true`) due to MIME-type issues — main-thread render is fine for short docs.

### PWA shell

- `public/manifest.webmanifest` present with proper icons in `public/icons/`.
- Install banner (`src/components/install-banner.tsx`) appears on `/clients` when the page is in Safari (not standalone) and `localStorage` flag isn't set. Dismissible. Modal walks through Share → Add to Home Screen → Confirm. Body scroll is locked when the modal is open.
- Service worker not yet wired with `@serwist/next` (was deferred; not blocking).

### UX hardening (Phases 1–5 from this conversation)

| Phase | What it added |
|---|---|
| **Phase 1** | Touch targets bumped to 44 px (delete buttons, viewer header buttons). Icon buttons given visible base background (`bg-card-hover/40`) instead of `:hover`-only states. **`rounded-button` → `rounded-btn` sweep** across 18 files. |
| **Phase 2** | Hydration fix for `new Date()` in form defaults (was firing different values server vs. client). Server action errors mapped to user-friendly strings. `(app)/error.tsx` route-group error boundary added. Loading skeletons for `/clients`, `/clients/[id]`, `/clients/[id]/stats`. |
| **Phase 3** | `useBodyScrollLock` hook applied to questionnaire overlay and install banner. New `safe-pl` / `safe-pr` / `safe-px` utilities. |
| **Phase 4** | All required-field validation removed except `name`. Submit button renamed "Save Client." `coachingType` defaults to `in_person`. |
| **Phase 5** | New `/clients/[id]/intake/edit` route + `updateClientFromIntake` action. Shared `clientValuesFromForm` and `intakeValuesFromForm` helpers in `src/lib/actions/intake.ts`. New `src/lib/intake-defaults.ts` maps DB rows → form defaults. ClipboardList button on client detail header. |

### Earlier UX work (committed before Phase 1)

- Bottom nav simplified from 4 tabs → 2 (Clients, Settings).
- Bottom nav now hidden on `/clients/new`, any `/intake/edit` route, and whenever the iOS keyboard is open.
- Keyboard-aware sticky submit bar using `useKeyboardInset` hook.

---

## Known quirks and gotchas (read this so you don't repeat our pain)

1. **Don't try to `pnpm db:push` from inside the Claude Code execution environment.** Outbound TCP to `neon.tech` is blocked by the environment's network policy (returns HTTP 403 / fails on WebSocket upgrade). All migrations are applied by **pasting SQL into Neon's web SQL Editor**. Workflow: edit `src/db/schema.ts` → `pnpm db:generate` → read the generated SQL → paste a cleaned version into the chat for the trainer to run in Neon's SQL Editor.

2. **The default Vercel branch is the working branch.** Pushing to `claude/trainer-pwa-setup-gLrMY` triggers an immediate production deploy. There's no separate `main`. So "make changes locally, don't push yet" is the way to stage anything risky.

3. **Vercel's auto-dependency-vulnerability-fix bot is not enough.** Early in the project the bot updated Next.js 15.1.4 → 15.1.11 to "fix React Server Components CVE vulnerabilities," but `pnpm audit` revealed 21 OTHER vulnerabilities still present (including CRITICAL CVE-2025-29927 middleware auth bypass). Always run `pnpm audit --prod` after any dep change.

4. **The user's questionnaire PDFs are exported from Google Docs.** They render perfectly in PDF.js. If a user uploads a non-Google-Docs PDF (e.g., one with embedded fonts or scanned images), react-pdf usually handles it but be aware that's the variability.

5. **Drizzle returns numeric columns as strings**, not numbers (because JS can't safely represent arbitrary-precision decimals). `src/lib/intake-defaults.ts` has a `parseNum()` helper for converting back. Use it for any read-side query that touches `numeric()` columns.

6. **react-pdf and pdfjs-dist version coupling.** If you upgrade react-pdf, immediately check what version of pdfjs-dist it expects and pin to that exact version in `package.json`. Mismatch causes silent blank canvas rendering — no error in the console.

7. **`disableWorker: true` on PDF.js is intentional.** Don't "fix" it without first solving the Vercel `.mjs` MIME-type issue.

8. **Bottom nav is hidden on focused-flow routes.** `/clients/new` and `*/intake/edit`. Plus auto-hidden when keyboard is open. Check `src/components/nav/bottom-nav.tsx` if you're adding a new route that should also hide it.

9. **`rounded-button` is not a Tailwind class.** Use `rounded-btn`. The whole codebase was swept once; don't reintroduce the typo.

10. **PDF.js worker file is gitignored.** It's regenerated on every `pnpm install` and `pnpm build` by `scripts/copy-pdf-worker.mjs`. Vercel's build picks it up because of the `prebuild` script. If you ever see "Loading viewer…" hang on Vercel, check that the worker file is actually being served at `/pdf.worker.min.mjs`.

11. **Server actions return `{ ok: true | false }` shape.** Established pattern — all new actions should match. Errors are user-friendly strings, never raw exceptions. Currently only `intake.ts` is fully mapped; `goals.ts`, `body-stats.ts`, `nutrition.ts`, `clients.ts` are pending the same treatment.

12. **The trainer uses iPad primarily for onboarding and iPhone for everything else.** Test both viewports when making UX changes. iPad Safari has its own quirks (pinch-zoom, fixed-position interaction with iOS keyboard).

---

## Last conversation summary (most recent first)

Working backwards through the chat:

**Auth was being scoped, then explicitly paused.** The user wanted email/password sign-in. We went through three pivots:
1. I recommended **Clerk** first (per the original plan); user said they'd prefer **Supabase Auth** since they know it from another webapp.
2. I pivoted to Supabase; user corrected — "we're using Neon, not Supabase. I want the same auth process but for Neon."
3. I researched **Neon Auth** (Neon's built-in auth product, powered by **Better Auth**). User went into the Neon dashboard, screenshotted the Auth section. We saw: Auth URL, JWKS URL, Domains config, Authentication toggles (email sign-up / sign-in both enabled), OAuth providers, Email provider with sender `auth@mail.myneon.app`, Webhooks toggle. We did NOT yet see the env vars / project ID / API keys needed for SDK integration.
4. I asked the user to click **"Open quickstart"** (a button in the Neon Auth dashboard) and screenshot the resulting integration code. **They never sent that screenshot.**
5. The user then said: *"Okay never mind, let's pivot away from the verification and authentication and move forward to the further development of the next steps on the webapp."* That's where we are.

**Immediately before that:** Phases 4 and 5 were committed and pushed (commits `0d1a282` and `71f0a62`). Verification agent reported zero regression risk, zero inconsistencies. Vercel redeployed cleanly.

**The user's eventual auth plan (when we return to it):**
- Email + password first.
- Magic links + email sending as a follow-up.
- Neon Auth (Better Auth under the hood) was the agreed direction.
- A workaround for "no restricted signups yet" feature: enable email sign-up only long enough to create the trainer's account, then toggle it off. Plus an app-level email allowlist as belt-and-suspenders.

---

## Where we paused and what's next

**The user's exact words** (paraphrased from final message): *"I want to continue this conversation in another chat... we can discuss the info section for each client. I am unsure what exactly i want to include in each info section after onboarding each client, or how to go about actually tracking my clients, so i will need your research as a backbone in this phase."*

**So the next session should:**

1. **Briefly confirm the handoff was received** — read this doc + the other three (Project Overview, Development Workflow, Roadmap).

2. **Research-backed proposal for the post-onboarding client info section.** The user wants help thinking through what to track for each client between sessions. Research areas to draw on:
   - Personal training industry standards for ongoing client tracking (PROs / RIR / RPE, lift PRs, body composition trends, adherence metrics, subjective wellness).
   - The 75 questionnaire fields we already have — many are intake-time only, but some (medical conditions, sleep, stress, training experience) should ideally be re-asked periodically.
   - Industry-standard cadence: weekly check-ins, monthly progress photos (we're not doing photos), quarterly reassessments.
   - The trainer's specific workflow: in-person sessions where data is entered live, plus remote-only clients where data comes asynchronously (we'd need an answer to this — how do they collect data for remote clients?).
   - What's already in the schema we haven't surfaced in UI yet (e.g., the `client_intake` table has dozens of fields that aren't displayed anywhere yet — the client detail page only shows summary blocks).

3. **Propose a few different "client info section" designs.** Not as code — as scannable design proposals (3–5 sentence summaries each, maybe screenshots / wireframes if relevant). Let the trainer pick. They've been good about choosing between options when presented clearly.

4. **Do NOT start coding until the trainer chooses.** They explicitly value verifying direction before execution.

5. **Auth remains paused.** Don't bring it up unless the trainer raises it. When they do, the next step is clicking "Open quickstart" in Neon Auth and screenshotting it so we can wire the Better Auth SDK.

6. **Other follow-ups that are quietly waiting:**
   - Map error messages in `goals.ts`, `body-stats.ts`, `nutrition.ts`, `clients.ts` server actions (currently they leak raw exceptions if they throw — would surface as ugly text via `(app)/error.tsx`).
   - Build M2 (workouts + sessions + PRs).
   - Build M3 (CSV import).
   - Verify loading skeleton heights match real page heights on slow networks (deferred from the Phase 2 audit).
   - Consider replacing `disableWorker: true` on PDF.js once the MIME issue is solved.

---

## Recent git history (use `git log --oneline -20` for the live version)

```
71f0a62  feat(intake): resume workflow — /clients/[id]/intake/edit route
0d1a282  fix(intake): make all fields optional except client name; rename submit to Save
01edb51  fix(ux): phase 3 — modal scroll lock + extended safe-area utilities
041402e  fix(ux): phase 2 — hydration, error mapping, error boundary, loading skeletons
f064886  fix(ux): phase 1 — touch targets, hover affordance, rounded-btn class
6683340  fix(ux): keyboard-aware bottom bars + hide nav on focused creation flow
aff12ab  feat(intake): convert 7 questions to multi-select per real-world client behavior
bd26163  fix(intake): audit findings — timeout leak, docx race, pinch listener churn, safe-area
c3b334b  fix(intake): switch PDF rendering to react-pdf with matching pdfjs-dist
c277f57  fix(intake): pass canvas element to PDF.js render (5.x API requirement) [obsolete after react-pdf switch]
c09afda  feat(intake): side-by-side questionnaire viewer on /clients/new
8a385fe  feat(nav): simplify to Clients + Settings; remove /sessions and /stats
6a51b06  chore(deps): upgrade Next/React/drizzle/postcss to fix 22 CVEs
74f8864  Merge pull request #1 from mendozay762-del/vercel/react-server-components-cve-vu-...
c815b35  Fix React Server Components CVE vulnerabilities
b177ce8  Bootstrap M1: clients, body stats, goals, nutrition PWA shell
```

The line above shows the work since project bootstrap. The most useful commits to read for context are: `b177ce8` (initial scaffold), `c09afda` (viewer), `c3b334b` (react-pdf pivot — the painful debug), `8a385fe` (nav simplification), `0d1a282` (validation relaxation), `71f0a62` (resume workflow).
