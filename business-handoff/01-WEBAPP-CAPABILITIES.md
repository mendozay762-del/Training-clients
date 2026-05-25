# 01 — Web App: Full Capabilities Reference

## What the app is, in one paragraph
It is a **private, single-user web application** that a solo personal trainer uses as their **coaching and back-office system**. It runs in a browser and is installed to the trainer's **iPad home screen** like an app (a PWA). Exactly **one person logs in — the trainer.** It is **not a product clients use.** Its job is to let the trainer onboard clients, design training programs, log workouts (live during a session or after the fact), and track each client's progress over time.

## Who uses it
- **The trainer:** the only user. Single email + password login.
- **Clients:** never log in. They never see the app directly. Anything a client receives (a program, a summary, progress numbers) is something the trainer exports, screenshots, or relays manually.

---

## Feature-by-feature

### 1. Authentication & access
- Single email/password login gate over the whole app.
- Session kept for ~30 days; "Sign out" available.
- Login is **rate-limited** (throttles repeated failed attempts) and runs over HTTPS.
- **Implication for business:** client data is reasonably protected, but there is **no multi-user system** — you cannot give a client (or a second trainer) their own login today.

### 2. Client management
- Create, edit, and (with a confirmation step) delete clients.
- A client "overview" hub shows, at a glance: today's planned workout, next scheduled session, this week's check-in, recent workouts, active program, goals, sessions, nutrition notes, and a messages summary.
- **Captures:** name, contact info, location, coaching type (in-person/remote), referral source, start date, budget range, communication preferences, goals summary, active/inactive status.

### 3. Intake questionnaire & liability waiver
- A **detailed (~75-question) intake questionnaire** transcribed by the trainer, covering: personal info, logistics (preferred gym, travel distance, equipment/gym access, days/week, session length, time of day), goals (primary/secondary, the "why," timeline, how they measure progress, commitment level), training history & experience, baseline lifts (squat/bench/deadlift/OHP/row), exercise preferences (enjoy/avoid, non-negotiables), **medical & PAR-Q screening** (heart conditions, chest pain, dizziness, bone/joint issues, medications, surgeries, injuries, current pain, doctor clearance), sleep/stress/lifestyle, and **nutrition** (dietary pattern, allergies, restrictions, typical day, water, alcohol, caffeine, supplements, biggest challenge).
- A built-in **PDF viewer** lets the trainer read the questionnaire PDF side-by-side while transcribing.
- A **versioned liability waiver** is captured with an acknowledgment name and timestamp.
- **Implication for business:** the intake + waiver make the operation look **professional and legitimate**, and the medical screening is a real risk-management/liability asset.

### 4. Program design ("training blocks")
- Programs are organized into **training blocks** (mesocycles, typically 2–6 months), each with a name, style (e.g., hypertrophy, strength, endurance, hybrid), start/end dates, a weekly-split summary, free-text notes, and a status (draft / active / completed).
- Programs are authored in a **Google Sheet** using a fixed column framework, then **pasted into an import box** in the app. The app parses the paste and creates dated **"prescribed workouts."**
- The framework columns are: `prescribed_for` (date), `workout_name`, `exercise_name`, `sets`, `reps`, `load`, `rir` (reps-in-reserve), `notes`. Headers are case-insensitive and tolerant of spaces.
- Each prescribed workout becomes a tappable day showing its exercises with sets, rep ranges, load, RIR, and notes.
- **Implication for business:** the trainer can produce and reuse structured programs **fast**, which is what makes taking on more clients feasible.

### 5. Session logging (the workout tracker)
- From a prescribed day, the trainer taps **"Start session,"** which creates the live workout, copies in that day's exercises, and **pre-creates the prescribed number of empty set rows** so logging is just filling in numbers.
- Per set, the trainer logs **reps × weight × RPE and/or RIR**, and can flag warm-up sets. An **estimated 1-rep-max** is shown per working set.
- Exercises and sets can be added or removed on the fly; each session has a notes field and an editable date.
- Missed days can be marked **"skipped"** (with a reason) so the program timeline stays intact.
- **Implication for business:** supports high-quality, data-rich in-person coaching, and produces the numbers used for progress and retention.

### 6. Progress tracking
- **Estimated-1RM trend charts** per lift (begins charting a lift once it has enough logged sessions).
- A **personal-record (PR) table** of best estimated-1RM per exercise.
- **Weekly adherence** (planned vs completed vs skipped).
- **Body-stat check-ins:** weekly weight, waist/chest/hips measurements, average sleep, and a wellness score, with notes.
- **Implication for business:** this is a powerful **retention and upsell tool** and a source of "real client data" content for marketing.

### 7. Supporting coaching tools
- **SMART goals** per client (with target dates and a done toggle).
- **Session scheduling** (date/time, duration, location, pre/post notes, status); the next session surfaces on the client overview.
- **Nutrition notes** (dated, free-form/Markdown).
- **Client communication log** (channel, message body, optional action item with a done toggle) — a lightweight CRM for client touchpoints.

---

## What the app explicitly does NOT do (today)
- **No client-facing access.** Clients can't log in, self-log workouts, or view their own data/progress in the app.
- **No payments, invoicing, subscriptions, or booking.**
- **No automated program delivery.** Programs are handed off manually (spreadsheet/printout/screenshot).
- **No messaging to clients** (the messages feature is the trainer's private log, not a chat with the client).
- **No multi-trainer / team support.**
- **No native mobile app** in app stores (it's a web app installed to the home screen).
- **No automated marketing, email, or social posting.**

## Technical & operational facts (context, not the focus)
- Modern web stack (Next.js/React, TypeScript), a managed Postgres database, hosted on a serverless platform (Vercel, currently the free "Hobby" tier).
- Data is encrypted at rest by the providers; access is over HTTPS.
- It is **live in production** and used on the trainer's iPad.
- It currently serves **one client's worth of real data.**

## Bottom line for strategy
The app is a **professional-grade coaching backend for the trainer** — excellent for delivering and proving results — but it is **not yet a client-facing product.** Any offer sold today is delivered through the *trainer*, not through clients using the app.
