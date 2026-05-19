# M-Builds Roadmap

> **Purpose.** A per-build plan for each milestone (M) in the post-onboarding tracking phase. Read before starting any build so we know exactly what's in scope, what's out, and how we know we're done. Builds are ordered easiest → hardest per the trainer's preference, accepting that the highest-pain item (prescription) lands last.

---

## Legend

- **Goal.** One sentence answering "what does this build deliver?"
- **Anchor.** Which Phase of `training-workflow.md` this build serves.
- **Schema.** Database tables / columns added or changed.
- **UI surfaces.** Pages, components, routes touched.
- **Server actions.** Named functions for create / update / delete.
- **Acceptance criteria.** Testable checklist — when every box is checked, the build is done.
- **Out of scope.** Things that *sound* related but are explicitly deferred to a later build. Prevents scope creep.
- **Dependencies.** What must already exist before starting.
- **Estimated effort.** Rough days of focused work.

---

# M2a — Waiver step

- **Goal.** Capture a client's electronic acknowledgment that they've read and accepted the liability waiver, and store when and what they signed.
- **Anchor.** Phase 1 (Onboarding).
- **Schema.**
  - Add to `client_intake` (or new `client_waivers` table — decide during build):
    - `waiver_version` (text) — which version of the waiver text was shown.
    - `waiver_accepted_at` (timestamptz) — when they clicked accept.
    - `waiver_signed_name` (text) — typed full legal name.
    - `waiver_ip` (text, nullable) — IP at signing, best-effort.
- **UI surfaces.**
  - `/clients/[id]/intake` — add a Waiver section near the end of the intake form.
  - Section shows the waiver text inline (scrollable), a typed-name field, and an "I acknowledge" checkbox. Submit blocked until both filled.
  - `/clients/[id]` detail page — surface "Waiver signed: [date]" badge; "Not signed" warning if missing.
- **Server actions.**
  - `acceptWaiver(clientId, signedName, waiverVersion)`.
- **Acceptance criteria.**
  - [ ] Waiver text visible inline during intake.
  - [ ] Typed name and checkbox both required to submit.
  - [ ] Acceptance timestamp + version persisted.
  - [ ] Client detail page shows waiver status.
  - [ ] Existing clients without a waiver show a clear "needs signing" banner.
  - [ ] Waiver text matches the standalone PDF version exactly.
- **Out of scope.**
  - PDF generation / download of the signed waiver (later — keep a Google Drive folder for now).
  - Multi-version waiver upgrade flows (we only have v1).
  - Real e-signature compliance (DocuSign / HelloSign — not needed for an informal practice).
- **Dependencies.** None. `client_intake` table already exists.
- **Estimated effort.** ~1 day.

---

# M2b — Communication log

- **Goal.** Record meaningful messages, calls, and conversations with a client so context isn't lost between sessions.
- **Anchor.** Phase 5 (Between Sessions).
- **Schema.**
  - New table `client_messages`:
    - `id` (uuid, pk)
    - `client_id` (uuid, fk → clients)
    - `occurred_at` (timestamptz)
    - `channel` (text) — `in_person` | `text` | `email` | `call` | `app`
    - `direction` (text) — `from_client` | `to_client` | `note`
    - `summary` (text) — short one-line.
    - `body` (text, nullable) — longer detail.
    - `action_item` (text, nullable) — what you owe them or vice versa.
    - `action_done` (bool, default false)
    - `created_at`, `updated_at` (timestamptz)
- **UI surfaces.**
  - `/clients/[id]` — new "Messages" tab/section, reverse-chronological list.
  - Inline "Log a message" form: channel + direction + one-liner + optional details + optional action item.
  - "Open action items" filter / count badge on the client card.
- **Server actions.**
  - `createMessage(clientId, payload)`
  - `updateMessage(messageId, payload)`
  - `deleteMessage(messageId)`
  - `markActionDone(messageId)`
- **Acceptance criteria.**
  - [ ] Can log a message in under 15 seconds from the client page.
  - [ ] List shows newest first with channel icon and date.
  - [ ] Action items have a checkbox; open count badged on the client.
  - [ ] Edit and delete work and are reversible (soft delete optional).
  - [ ] Mobile (iPad) layout works — that's where most logging happens.
- **Out of scope.**
  - Two-way messaging (sending SMS / email *from* the app).
  - Threading / replies — flat list is enough.
  - Push notifications.
  - Importing message history from SMS or email.
- **Dependencies.** None. Pattern mirrors existing `nutrition_notes`.
- **Estimated effort.** ~2 days.

---

# M2c — Session log

- **Goal.** Live-log every set (reps × load × RPE) during a training session, with end-of-session notes. Replaces paper / Notes app.
- **Anchor.** Phase 4 (Per Session).
- **Schema.**
  - Tables `workouts`, `workout_exercises`, `workout_sets` already exist in the schema (per handoff). Verify columns; add if missing:
    - `workouts`: `id`, `client_id`, `performed_on`, `started_at`, `ended_at`, `readiness_sleep` (int 1–10), `readiness_energy` (int 1–10), `readiness_soreness` (int 1–10), `notes` (text), `created_at`, `updated_at`.
    - `workout_exercises`: `id`, `workout_id`, `exercise_name`, `order_index`, `notes`.
    - `workout_sets`: `id`, `workout_exercise_id`, `set_index`, `reps`, `load_lb` (numeric), `rpe` (numeric 1–10), `is_warmup` (bool), `created_at`.
  - Optional: derived view `client_e1rm` (Epley or Brzycki) per exercise per workout.
- **UI surfaces.**
  - `/clients/[id]/workouts` — list of past workouts, newest first, with date + summary.
  - `/clients/[id]/workouts/new` — start a new session: readiness check first, then exercise rows with set rows.
  - `/clients/[id]/workouts/[workoutId]` — view + edit a logged workout.
  - "Today's session" hero on client detail (when in M2e — for now just a button to start a fresh workout).
- **Server actions.**
  - `startWorkout(clientId, readiness)`
  - `addExercise(workoutId, exerciseName)`
  - `logSet(exerciseId, reps, load, rpe, isWarmup)`
  - `updateSet(setId, payload)`
  - `endWorkout(workoutId, notes)`
- **Acceptance criteria.**
  - [ ] Can log a set with two thumb taps on iPad.
  - [ ] Last set's load + reps pre-fills the next set.
  - [ ] Each exercise shows running set total and last-session comparison.
  - [ ] Readiness check (sleep / energy / soreness) captured at start.
  - [ ] End-of-session notes field, mandatory but can be a single character.
  - [ ] Per-set e1RM displayed inline (informational).
  - [ ] Works offline-ish: a flaky connection doesn't lose a set (debounced server writes).
- **Out of scope.**
  - Prescription comparison ("you missed your target") — that's M2e.
  - Auto load-progression next session — M2e.
  - Rest timer / stopwatch.
  - Video upload of sets.
  - Templates / copy last week's workout — M2e.
- **Dependencies.** Workout tables exist or will be added/verified at start of build.
- **Estimated effort.** ~3–4 days.

---

# M2d — Progress dashboards

- **Goal.** Show the client (and remind the trainer) how they're trending: PRs, e1RM curves, body-stat trends, adherence %, goal progress.
- **Anchor.** Phase 6 (End of Block) — but visible anytime.
- **Schema.** No new tables. Possibly add a couple of materialized views or derived queries:
  - `client_prs` — best load × reps per exercise per client, with date.
  - `client_e1rm_series` — daily best e1RM per exercise.
  - `client_adherence` — prescribed vs. completed workouts per week (needs M2e data; before that, just completed-workout count per week).
- **UI surfaces.**
  - `/clients/[id]/progress` — single page, multiple cards:
    - PR table (top exercises, current best, date set).
    - e1RM line chart per major lift.
    - Body weight + waist trend (uses existing `body_stats`).
    - Adherence bar chart (workouts/week).
    - Goal progress card — each SMART goal with a progress bar where possible.
  - Add "Progress" link to client nav.
- **Server actions.** Read-only — no mutations. Just query layer.
- **Acceptance criteria.**
  - [ ] Page loads in under 2 seconds with 6 months of data.
  - [ ] Charts handle empty-data gracefully (empty-state message, not a crash).
  - [ ] PR table updates within the same session after a new set is logged.
  - [ ] Goal progress shows numeric progress for measurable goals and "in progress" for non-numeric.
  - [ ] iPad layout: cards stack to a single column.
- **Out of scope.**
  - Client-facing public/share link.
  - PDF / image export of the dashboard.
  - Comparing two clients side by side.
  - Cohort or business-level analytics ("avg client retention").
- **Dependencies.** M2c (session log) for lift data. Existing `body_stats` and `goals` already in place.
- **Estimated effort.** ~2–3 days.

---

# M2e — Prescription engine

- **Goal.** Prescribe a block of training in advance — phases, weekly templates, day-by-day prescribed sets — so the trainer always walks into a session with the plan ready, and the session log compares actual vs. prescribed.
- **Anchor.** Phase 3 (Program Design) + integrates with Phase 4 (Per Session).
- **Schema.**
  - `training_blocks`:
    - `id`, `client_id`, `name`, `style` (text — `hypertrophy` | `strength` | `endurance` | `cardio` | `hybrid` | `other`), `start_date`, `end_date`, `weekly_split_summary` (text), `progression_scheme` (text), `notes`, `status` (text — `draft` | `active` | `completed`), `created_at`, `updated_at`.
  - `training_phases`:
    - `id`, `block_id`, `name`, `phase_index`, `start_date`, `end_date`, `focus` (text), `notes`.
  - `prescribed_workouts`:
    - `id`, `client_id`, `phase_id` (nullable), `prescribed_for` (date), `name`, `notes`, `status` (text — `planned` | `completed` | `skipped`), `actual_workout_id` (uuid, nullable, fk → workouts).
  - `prescribed_exercises`:
    - `id`, `prescribed_workout_id`, `exercise_name`, `order_index`, `sets`, `reps_low`, `reps_high`, `load_lb` (nullable), `load_pct_1rm` (nullable), `rpe_target` (nullable), `notes`.
- **UI surfaces.**
  - `/clients/[id]/program` — block + phase overview, current week table.
  - `/clients/[id]/program/blocks/new` — create a block.
  - `/clients/[id]/program/blocks/[blockId]` — edit a block: phases, weekly template, generate prescribed workouts for the block's date range.
  - `/clients/[id]/program/prescribed/[id]` — view/edit a single prescribed workout.
  - Client detail page hero: **"Today's Plan"** card — top of page, shows today's prescribed workout, "Start session" button that creates a `workouts` row pre-populated from the prescription.
  - Calendar view of the block (week strip on mobile, month grid on desktop).
- **Server actions.**
  - `createBlock`, `updateBlock`, `archiveBlock`
  - `createPhase`, `updatePhase`, `deletePhase`
  - `generatePrescribedWorkouts(blockId, weeklyTemplate)` — fills the calendar.
  - `updatePrescribedWorkout`, `deletePrescribedWorkout`
  - `startSessionFromPrescription(prescribedWorkoutId)` — creates a `workouts` row, links via `actual_workout_id`, pre-populates exercises and target sets.
  - `completePrescription(prescribedWorkoutId)`, `skipPrescription(prescribedWorkoutId, reason)`.
- **Acceptance criteria.**
  - [ ] Can create a 12-week block in under 10 minutes (including a weekly template).
  - [ ] "Today's Plan" card on client detail shows the right workout for today.
  - [ ] Starting from a prescription pre-fills the session log with exercises and target sets.
  - [ ] Skipped workouts get a reason and are reflected in adherence.
  - [ ] Block can be edited mid-flight (e.g., shift everything by a week) without losing logged sessions.
  - [ ] Adherence on M2d dashboard now uses prescribed-vs-completed.
  - [ ] Works on iPad and phone.
- **Out of scope.**
  - Pre-built exercise library / database (write exercise names freehand per trainer's preference).
  - Block templates ("copy this block from another client"). Each block written fresh — explicit trainer preference.
  - Auto-progression algorithm — trainer adjusts week-to-week manually for now.
  - Client-facing prescription view (trainer-only UI for v1).
- **Dependencies.** M2c (session log) so prescriptions can link to actual workouts.
- **Estimated effort.** ~5–7 days. Biggest build in the phase.

---

# M3 — CSV / spreadsheet import (post-M2)

- **Goal.** One-shot importer to pull existing client history from Google Sheets / Notes / CSV into the app, so legacy clients aren't stuck without baseline data.
- **Anchor.** Backfills Phases 1, 2, 5 for existing clients.
- **Schema.** No new tables. Possibly an `imports` audit table (`source`, `file_name`, `imported_at`, `row_count`).
- **UI surfaces.**
  - `/clients/[id]/import` — drag-drop a CSV, preview, map columns, commit.
  - Templates for the common shapes: weight log, lift log, measurements.
- **Server actions.**
  - `previewImport(clientId, fileBuffer)`
  - `commitImport(clientId, mapping)`
- **Acceptance criteria.**
  - [ ] Can import a body-weight log (date, lb) cleanly.
  - [ ] Can import a lift log (date, exercise, reps, load) cleanly.
  - [ ] Bad rows are surfaced and skipped, not silently dropped.
  - [ ] Re-running the same import doesn't duplicate rows (de-dupe by date + value).
- **Out of scope.**
  - Generic ETL — only the formats the trainer actually uses.
  - Two-way sync. One direction only: into the app.
- **Dependencies.** M2c and M2d in place so imported data has a home.
- **Estimated effort.** ~2–3 days.

---

# M4 — Authentication (when ready for production)

- **Goal.** Lock the app behind a login so only the trainer (and eventually clients) can see data.
- **Anchor.** Cross-cutting — required before any client sees the app or before deploying to a public URL.
- **Schema.** Use Supabase Auth — `auth.users` is provided. Add an `app_user_roles` table mapping user → role (`trainer` | `client_viewer`) and a `client_owner_id` (uuid) column on `clients`.
- **UI surfaces.**
  - `/login` — magic link or email + password.
  - Middleware on all `/clients/**` routes — redirect unauthenticated to `/login`.
  - Account dropdown in nav.
- **Server actions.**
  - Wire Supabase auth helpers.
  - Every existing server action gets a `getCurrentUser()` check.
- **Acceptance criteria.**
  - [ ] Unauthenticated requests to `/clients/**` redirect.
  - [ ] Trainer sees all their clients; no leakage between trainers (RLS policies in place).
  - [ ] Clients (when invited) see only themselves.
  - [ ] Password reset / magic link flow works.
- **Out of scope.**
  - Multi-tenant billing.
  - SSO / Google login (later).
  - Client invitation flow with branded emails (later).
- **Dependencies.** Pre-deploy gate. RLS policies on every table.
- **Estimated effort.** ~3–5 days including RLS audit.

---

## Sequencing summary

| Order | Build | Anchor | Effort |
|---|---|---|---|
| 1 | M2a — Waiver | Phase 1 | ~1 day |
| 2 | M2b — Communication log | Phase 5 | ~2 days |
| 3 | M2c — Session log | Phase 4 | ~3–4 days |
| 4 | M2d — Progress dashboards | Phase 6 | ~2–3 days |
| 5 | M2e — Prescription engine | Phase 3 | ~5–7 days |
| 6 | M3 — CSV import | Backfill | ~2–3 days |
| 7 | M4 — Auth | Pre-deploy | ~3–5 days |

**Total estimated effort:** ~18–25 days of focused work to reach a launchable product.

---

## Rules for this phase

1. **One build at a time.** Finish acceptance criteria for the current M before opening the next.
2. **No surprise refactors.** If a refactor is tempting, write it down for later, finish the build first.
3. **Commit small.** Each acceptance-criteria checkbox is roughly one commit.
4. **Test on iPad and phone.** Desktop is for development; the real device matters.
5. **Re-read `training-workflow.md` before each new build.** Keeps the build anchored to actual user need.
