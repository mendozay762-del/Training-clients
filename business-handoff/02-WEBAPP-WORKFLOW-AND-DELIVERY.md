# 02 — Web App: Workflow & Program Delivery

This document explains *how the app is actually used* end-to-end, and — critically for sales — *how a program reaches a client.*

## The coaching lifecycle the app supports
The app is built around a six-phase coaching flow (documented in the trainer's own workflow reference):

1. **Onboarding (Day 0):** client fills a ~75-question questionnaire; the trainer transcribes it into the app (PDF + form side-by-side on the iPad), captures the liability waiver, and sets 1–3 SMART goals.
2. **Assessment (Days 1–7):** movement screen + baseline lifts (squat/bench/deadlift/OHP/row at moderate effort) and body measurements (in person), or video + self-report (remote).
3. **Program design (Days 1–7):** pick a block style (hypertrophy/strength/endurance/hybrid), set block length (2–6 months) and weekly split, write the progression scheme, and detail the first 1–2 weeks.
4. **Per session:** before — glance at today's prescribed workout; during — log each set (reps × load × RPE/RIR); after — quick session notes; next session's load is adjusted from today's performance.
5. **Between sessions:** quick check-ins logged in the messages tool; a weekly check-in (weight, sleep, wellness); measurements every 2–4 weeks.
6. **End of block (every 2–6 months):** re-run baseline assessments, compare to start, show the client their progress, and decide the next block.

## The programming framework (how programs are built)
Programs are authored in a **Google Sheet** with a fixed set of columns, then **pasted into the app's import box**, which converts them into dated workouts.

Columns: `prescribed_for` (date, e.g. 2026-06-01), `workout_name` (e.g. "Upper A"), `exercise_name`, `sets`, `reps` (a number, a range like `6-10`, or free text like `AMRAP`), `load` (a number, a `%`, or free text like `BW`), `rir` (reps in reserve), `notes` (cues, rest, etc.).

- One row per exercise; the date + workout name repeat down each day's rows.
- Rest days are simply omitted (a date with no rows = rest).
- After import, each day appears as a tappable card grouped by week, showing its planned exercises.
- The trainer typically builds **1–2 weeks at a time** (or a full block) and re-imports as the program progresses, because loads adapt to performance.

## Delivery model A — Live, trainer-logged (in-person)
1. Trainer opens the client and the day's prescribed workout on the iPad.
2. Taps **Start session**; the day's exercises appear with the right number of empty set rows.
3. During the session, the trainer logs reps/weight/RPE/RIR per set.
4. Afterward: session notes; progress charts update automatically.
5. **Client experience:** high-touch, in-person; the client sees their numbers/progress when the trainer shows them.
- **This is fully supported by the app.** It is premium and time-intensive (doesn't scale beyond the trainer's available hours).

## Delivery model B — Remote / self-run program
1. Trainer designs a block in the sheet (and/or the app) for the client.
2. **The client receives the program outside the app** — i.e., the spreadsheet, a printout, or a screenshot — because clients cannot log into the app.
3. The client runs the program on their own and reports back (numbers, how it felt, video).
4. The trainer logs/records what's relevant on their side and adjusts the next block.
5. **Client experience:** they follow a spreadsheet/document; there is **no polished client app or self-logging experience today.**
- **This scales** (less trainer time per client) but the client-facing artifact is currently a **sheet, not software.** A client-facing app/portal would be a future build.

## Delivery model C — Hybrid
- A self-run program **plus** scheduled check-ins and/or video form-review and periodic in-person or virtual sessions. Combines B's scalability with some of A's accountability/touch.

## How progress is tracked and shown
- The app computes **estimated 1RM trends**, a **PR table**, **weekly adherence**, and **body-stat trends** from logged data.
- For in-person clients this is automatic. For remote clients it depends on what they report back and what the trainer logs.
- **Sales/marketing relevance:** these outputs are the trainer's strongest proof-of-results assets (progress graphs, PRs, adherence) and content material — but right now there's only one client's worth of data to draw from.

## The honest constraint to keep front-of-mind
Everything client-facing flows **through the trainer**. The app makes the trainer fast, organized, and credible, and it produces great progress data — but a client buying a "program they run on their own" today gets a **document**, not a login. Pricing, positioning, and promises should reflect that until/unless a client-facing experience is built.
