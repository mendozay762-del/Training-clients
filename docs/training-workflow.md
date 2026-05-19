# Training Workflow Reference

> **Purpose.** A reference for the trainer's day-to-day workflow: how information moves from new-client onboarding through long-term tracking. Re-read regularly until the flow is automatic.

---

## SMART goals — what it means in this workflow

Every client gets 1–3 SMART goals on file, set at onboarding and re-evaluated at the end of each training block.

- **S — Specific.** "Lose weight" is not specific. "Lose 15 lb of fat" is.
- **M — Measurable.** A number or clear pass/fail. Body weight, lift load, conditioning time, body-fat %.
- **A — Achievable.** Based on the client's training age and life context. Don't promise a 405 squat in 12 weeks to a beginner.
- **R — Relevant.** Tied to *their* "why" from the questionnaire. A goal they don't actually care about won't stick.
- **T — Time-bound.** A deadline. End of the current block, 90 days out, by their wedding.

**Examples:**
- "Bench press 185 lb for 5 reps by August 1."
- "Run a 5K in under 28 minutes by the end of this block."
- "Add 10 lb of lean mass by November 1 while staying below 18% body fat."

---

## The Flow — phase by phase

### Phase 1 — Onboarding (Day 0)

- Client fills the 75-question PDF questionnaire on their own time.
- You sit with them (or work remotely) and walk through it on the iPad — app shows PDF + form side-by-side.
- You transcribe their answers. Save with whatever's filled. Resume later if needed.
- Set 1–3 SMART goals.

**Recorded:** intake answers, goals, any baseline measurements available.

### Phase 2 — Assessment (Days 1–7)

- **In-person:** movement screen (NASM overhead squat assessment), baseline lifts (squat / bench / DL / OHP / row at moderate effort — not 1RM), body comp (weight, waist, chest, hips).
- **Remote:** client submits video of basic movements + self-reported lift numbers + their own measurements.

**Recorded:** baseline lifts, body stats, movement notes, observed limitations.

### Phase 3 — Program Design (Days 1–7)

- Pick a block style based on goals: hypertrophy / strength / endurance / cardio-focused / hybrid.
- Set block length (2–6 months) and weekly split.
- Write the progression scheme — how load advances week-to-week (linear, double progression, RPE-based, etc.).
- Plan the first 1–2 weeks of sessions in detail.

**Recorded:** block name, phase, start/end dates, weekly template, prescribed exercises with sets/reps/load/RPE target.

### Phase 4 — Per Session

**In-person:**
1. **Before** — open the client on iPad, glance at today's prescribed workout.
2. **Arrive** — 30-second readiness check (sleep, soreness, energy 1–10).
3. **During** — log each set as it happens: reps × load × RPE.
4. **End** — 60 seconds of notes: what worked, what to change, any pain.
5. **After** — next session's load auto-adjusts based on today's RPE.

**Remote / hybrid:**
1. You publish the week's workouts (app or Google Sheet).
2. Client performs solo, logs into the Sheet.
3. You review on a fixed day (e.g., Sunday).
4. You write feedback and adjust the upcoming week.
5. Weekly form-check video from the client.

### Phase 5 — Between Sessions

- **Daily-contact clients:** quick check-ins via message. Log meaningful exchanges (date, channel, summary, action item).
- **Weekly check-in form:** body weight, sleep average, wellness 1–10, nutrition adherence, cardio adherence.
- **Every 2–4 weeks:** body measurements (waist / chest / hips).

### Phase 6 — End of Block (every 2–6 months)

- Re-run the baseline assessments from Phase 2.
- Compare against starting numbers — show the client their progress visually.
- Decide: same block style next, or change direction?
- Set goals for the next block.

---

## In-person vs. remote — at a glance

| Step | In-person | Remote |
|---|---|---|
| Onboarding | iPad, side-by-side | Video call, share screen |
| Assessment | Live measurement + lifts | Video submission + self-report |
| Programming | Published in app | Published in app + Google Sheet copy |
| Session execution | You log live during the session | Client logs in their Sheet, you review weekly |
| Form check | Live coaching | Weekly video submission |
| Check-ins | Daily in-person + messages | Daily messages + weekly written check-in |

---

## What gets logged where (cheat sheet)

| Data | When | Where in app |
|---|---|---|
| Intake answers | Day 0 | `client_intake` table (built) |
| SMART goals | Day 0 + block end | `goals` table (built) |
| Baseline assessments | Days 1–7 | `body_stats` + future `lift_baselines` |
| Prescribed workout | Program design | Future `workouts` / `workout_exercises` (planned) |
| Actual sets/reps/load/RPE | During session | Future `workout_sets` (planned) |
| Coaching notes | End of session | Future field on `workouts` |
| Adherence (% completed) | Computed | Derived from prescribed vs. actual |
| Weekly check-in | Weekly | `body_stats` (built; expand) |
| Body measurements | Every 2–4 wks | `body_stats` (built) |
| Communication | Ad-hoc | Future `messages` table |

---

## Re-read cadence

Open this doc:
- Before designing any new client's first block.
- At the end of each block during the review/reassessment.
- Once a month even if nothing changed — repetition refreshes the pattern.
