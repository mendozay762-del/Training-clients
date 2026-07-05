# CSV Program Format — Spec + Rationale (Trainer Clients)

This is the exact CSV the trainer's **PDF-builder app** should emit, which is
then pasted into the Trainer Clients **program import** box. Give this whole file
to the PDF-builder chat so it produces the CSV correctly every time.

---

## 1. The header (exact, in this order)

```
prescribed_for,workout_name,exercise_name,sets,reps,load,rpe,rir,notes
```

**One row = one exercise.** All rows that share the same `prescribed_for` **and**
`workout_name` are grouped into a single training **day**. Exercise order within
a day follows row order in the file.

## 2. Column-by-column rules

| Column | Format | Examples | Notes |
|---|---|---|---|
| `prescribed_for` | `YYYY-MM-DD` | `2026-06-22` | The calendar date of the session. Drives week/mesocycle placement. |
| `workout_name` | free text (no commas) | `Wk1 Upper A` | Label for the day. Rows with the same date + name = one day. |
| `exercise_name` | free text (no commas) | `Barbell Bench Press` | Movement name. |
| `sets` | integer | `4` | Number of working sets. Must equal the token count in per-set `reps`/`rir`. |
| `reps` | number, range, per-set, or text | `8`, `8-10`, `8-10 \| 8-10 \| 6-8`, `AMRAP` | Target reps. See §3. |
| `load` | weight, %1RM, or text | `185`, `75%`, `BW`, `BW+25` | Prescribed load. See §3. |
| `rpe` | usually blank | *(empty)* | Left empty — the trainer programs by **RIR**, not RPE. |
| `rir` | **range, per set** | `1-2 \| 1-2 \| 0-1` | **Always a range; one token per set.** See §3. This is the important one. |
| `notes` | free text (no commas) | `Controlled eccentric; touch chest.` | Coaching cue. Use semicolons, never commas. |

## 3. The value grammar (reps / load / rir)

- **Single value** → applies to every set: `reps=8` on a 4-set row = 8 reps all
  four sets.
- **Range** → a low–high target: `reps=8-10`, `rir=1-2`.
- **Per-set list** → tokens separated by ` | ` (space-pipe-space); the number of
  tokens **must equal `sets`**. Example on a 4-set row:
  `rir = 1-2 | 1-2 | 1-2 | 0-1`.
- **Text** → free text passes through: `reps=AMRAP`, `load=BW+25`, `load=75%`.

**RIR default the trainer uses:** early sets `1-2`, final set `0-1`.
- 3 sets → `1-2 | 1-2 | 0-1`
- 4 sets → `1-2 | 1-2 | 1-2 | 0-1`

## 4. What is NOT in the CSV

- **Mesocycle name.** It is typed into the import box in the webapp, once per
  import (each import = one mesocycle). Do **not** add a mesocycle column.
- **Client name, program name, week number.** Program is chosen in the app; week
  is derived from `prescribed_for`.

## 5. Worked example (one day)

```
prescribed_for,workout_name,exercise_name,sets,reps,load,rpe,rir,notes
2026-06-22,Wk1 Upper A,Barbell Bench Press,4,6-8,185,,1-2 | 1-2 | 1-2 | 0-1,Controlled eccentric; touch chest.
2026-06-22,Wk1 Upper A,Barbell Row,4,8-10,155,,1-2 | 1-2 | 1-2 | 0-1,Chest-supported if low back is cooked.
2026-06-22,Wk1 Upper A,Incline DB Press,3,8-12,60,,1-2 | 1-2 | 0-1,Load is per dumbbell.
2026-06-22,Wk1 Upper A,Lat Pulldown,3,10-12,130,,1-2 | 1-2 | 0-1,
2026-06-22,Wk1 Upper A,Cable Lateral Raise,3,12-15,15,,1-2 | 1-2 | 0-1,Slow tempo; no swing.
```

A full 4-week Upper/Lower example lives in `andy-4-week-upper-lower.csv`.

---

## 6. Why it's laid out this way (design rationale)

- **One row per exercise (long format), not one row per day.** It keeps every
  cell atomic, lets a day have any number of exercises without reshaping the
  header, and makes the file trivial to diff, sort, and machine-generate. Days
  are reconstructed by grouping on `prescribed_for` + `workout_name`.

- **`prescribed_for` is a real date, and it's the anchor.** The app derives both
  the **week** (numbered within the mesocycle) and the day's position from the
  date, so the sheet never has to carry a "week 3, day 2" that can drift out of
  sync. Change a date and the app re-places the day automatically.

- **RIR is a *range*, always, and *per set*.** This mirrors how the trainer
  actually autoregulates: effort ramps across a session (leave 1–2 in reserve
  early, push to 0–1 on the last set). A single number can't express that ramp,
  and a hard number ("RIR 1") is falsely precise for a human judging effort. The
  ` | ` per-set list is the smallest notation that captures "different target on
  each set," and the app stores it in `prescribed_sets` so the live logger can
  float the correct target above each individual set's box.

- **RPE column exists but stays blank.** RPE and RIR are two dials for the same
  thing (RPE 8 ≈ RIR 2). The trainer coaches in **RIR**, so RPE is left empty —
  but the column stays in the schema so a future program *could* use RPE without
  changing the format.

- **Mesocycle is set at import, not in the sheet.** A mesocycle is a property of
  a *block of weeks*, not of any single exercise row. Repeating "Mesocycle 1" on
  80 rows would be redundant and error-prone (one typo splits the mesocycle in
  the UI). Typing it once at import is DRY and matches the workflow: **one import
  = one mesocycle**, built one at a time so the trainer can autoregulate the next
  phase off the last one's results.

- **`load` is permissive (weight | %1RM | text).** Real programming mixes
  absolute loads (`185`), intensity (`75%`), and bodyweight variants (`BW+25`).
  Forcing one unit would lose information; the app stores whichever form is given
  and displays it verbatim.

- **No commas inside any cell; notes use semicolons.** The import is plain CSV
  split on commas — a stray comma in a note or exercise name silently shifts
  every later column. Semicolons keep multi-part cues readable without breaking
  parsing.

- **Weight-first set rows (in the logger, downstream of this format).** When
  logging, the trainer types **weight → reps → RPE → RIR**, because weight is the
  first thing known at the rack. The CSV feeds the reps/RIR *targets* that float
  faintly above those boxes.

- **The plan and the actual are separate on purpose.** This CSV writes the
  *plan* (`prescribed_*` tables). Logging a session writes the *actual*
  (`workout_*` tables) and links back to the planned day. That separation is why
  deleting or editing a plan never destroys a performed session, and why a
  hand-logged session can be attached to the program after the fact.
