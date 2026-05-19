# Trainer Clients — Project Overview

> **Read this first.** This is a Next.js 15 PWA called *Trainer Clients*, built for a solo personal trainer who manages 1–5 clients. The whole purpose is one private place for client profiles, intake questionnaires, workouts, weekly check-ins, lift PRs, session calendar, goals, and nutrition notes. The trainer is the only user; clients never log in.

---

## What we're building

**The user.** A solo personal trainer with 1–5 active clients. Today they juggle client info across Google Docs, Notes, screenshots, and memory. The app gives them one place for everything client-related, accessible primarily from iPad (during in-person sessions / onboarding) and iPhone (between sessions, for quick reference).

**The form factor.** Installable Progressive Web App. Lives on the iPhone home screen as a normal-feeling app. No App Store. No offline support in v1.

**Their workflow being supported.**
1. New client fills out a 75-question PDF intake questionnaire (formerly Google Docs, exported to PDF).
2. Trainer opens the app on iPad, uploads the PDF for side-by-side viewing, types the answers into the intake form.
3. Once onboarded, the trainer references and updates the client's record between sessions: workouts entered manually (CSV import is a later milestone), weekly check-ins (weight, sleep, wellness, optional measurements), goals tracked, nutrition notes appended.
4. Phone is the read-heavy device; iPad is the write-heavy device.

---

## Tech stack (exact versions matter — pinned ones are intentional)

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 15.5.18** | App Router. `--turbopack` in dev. Production build is Webpack 5. |
| Language | **TypeScript 5.7.3**, `strict: true` | No `any` in source. |
| React | **19.2.6** | Server Components + Server Actions. |
| Styling | **Tailwind CSS 3.4.17** + **shadcn/ui** primitives | Dark-first theme. Mirrors the user's "book-tracker" webapp visually. |
| DB | **Neon Postgres** (`@neondatabase/serverless` 0.10.4) | HTTP driver, not WebSocket. Lazy DB-client init. |
| ORM | **Drizzle 0.45.2** + **drizzle-kit 0.31.10** | Schema in TS, migrations generated as SQL. |
| Forms | **react-hook-form 7.54.2** + **Zod 3.24.1** + `@hookform/resolvers` 5.2.2 | Single Zod schema as source of truth for client + server validation. |
| PDF viewer | **react-pdf 10.4.1** + **pdfjs-dist 5.4.296** (pinned) | Version mismatch was the cause of multi-hour debugging — see Workflow doc. |
| .docx viewer | **mammoth 1.12.0** | Client-side `.docx → HTML`. |
| Icons | **lucide-react** | Standardized sizes: `h-4 w-4` for inline, `h-5 w-5` for nav. |
| PWA | Manifest + service worker (not yet wired with @serwist) | iOS install banner present, working. |
| Charts | **Recharts 2.15.0** | Used on `/clients/[id]/stats`. |
| Hosting | **Vercel** Hobby tier | Auto-deploys from the working git branch. |
| Package manager | **pnpm 10.0.0** | Pinned via `packageManager`. `engines` block: Node ≥22, pnpm ≥10. |

**Notable absences (intentional, for now):**
- No auth provider yet (auth was paused — see Current State doc).
- No image/photo handling. Clients show as initials avatars. Workout photo uploads explicitly removed from plan.
- No Google Drive / Google Docs API. Trainer uploads PDFs manually.

---

## Design system

The visual language mirrors the user's existing book-tracker app: near-black background, dark elevated cards, blue accent for primary actions, big bold page titles, hero "next thing" cards at the top of each screen, generous spacing.

### Design tokens

Defined in `src/app/globals.css` as CSS variables, wired into Tailwind in `tailwind.config.ts`. All colors use the `rgb(var(--token) / <alpha-value>)` pattern so opacity utilities like `bg-card/40` work.

| Token | Value | Used for |
|---|---|---|
| `--bg-base` | `#0a0a0a` | Page background |
| `--bg-card` | `#161616` | Cards |
| `--bg-card-hover` | `#1f1f1f` | Hover / press state, touch affordance |
| `--border-subtle` | `rgba(255,255,255,0.06)` | Card borders, dividers |
| `--text-primary` | `#fafafa` | Titles, primary content |
| `--text-secondary` | `#a3a3a3` | Subtitles, metadata |
| `--text-tertiary` | `#6b6b6b` | Tiny meta, timestamps |
| `--accent-blue` | `#3b82f6` | Primary actions, hero accent stripe |
| `--accent-green` | `#22c55e` | Success, progress |
| `--accent-red` | `#ef4444` | Destructive |

**Border radius tokens (this caused real bugs — be careful):**
- `rounded-card` = 12px (cards)
- `rounded-btn` = 10px (buttons)
- **`rounded-button` DOES NOT EXIST.** Use `rounded-btn`. Earlier in the project, 18 components used `rounded-button` and Tailwind silently emitted no radius. A sweep fixed all of them. If you introduce new buttons, use `rounded-btn`.

**Custom utilities in `globals.css`:**
- `.safe-pb`, `.safe-pt`, `.safe-pl`, `.safe-pr`, `.safe-px` — `padding: env(safe-area-inset-*)`. Used on fixed-position bars and modals to clear iPhone notch / home indicator.
- `.tabnums` — `font-variant-numeric: tabular-nums`. Used for any numbers (weight, dates, page counts).

### Typography

System font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif`. No custom font load. On iOS this resolves to SF Pro, matching the book-tracker reference.

| Style | Class | Use |
|---|---|---|
| Page title | `text-3xl font-bold` | "Clients" / "New client" |
| Section label (uppercase) | `text-xs uppercase tracking-wider text-text-secondary` | "WORKOUTS" / "GOALS" / "NEXT SESSION" |
| Card title | `text-base font-semibold` | Client name, workout date |
| Card subtitle | `text-sm text-text-secondary` | Metadata under card titles |
| Tiny meta | `text-xs text-text-tertiary` | Timestamps |

### Touch targets & affordance (real iOS constraints)

- All tappable elements ≥ 44 × 44 CSS px (Apple HIG minimum). Most icon buttons are `h-11 w-11`.
- Icon buttons get a visible base background (`bg-card-hover/40`) instead of relying on `:hover`, because `:hover` never fires on iOS Safari touch. The hover state still applies on pointer devices via a stronger `bg-card-hover` on hover.
- Form inputs (`<input>`, `<textarea>`) all use `text-base` (16 px) so iOS Safari doesn't auto-zoom on focus.
- Fixed-position bottom bars (submit bar, bottom nav) use the `useKeyboardInset` hook to track `window.visualViewport` and float above the iOS keyboard / autofill accessory.

### Component shapes

- **Hero card** (`src/components/clients/hero-card.tsx`): card with 4 px blue left-edge stripe, uppercase blue label, bold title, secondary metadata, optional right-aligned action chevron. Used at the top of any screen with a clear "next thing."
- **Section block** (`src/components/clients/section-block.tsx`): card with uppercase label, optional `+` add button and `>` view button on the right, preview rows, "View all →" link. Used on the client detail page for workouts / goals / sessions / nutrition.
- **List card** (`src/components/clients/client-list-card.tsx`): tappable client row with initials avatar, title, subtitle.
- **Form fields** (`src/components/intake/fields/*.tsx`): TextField, YesNoField, SingleSelectField, MultiSelectField, ScaleField, ConditionalReveal wrapper, FieldLabel.
- **Bottom nav** (`src/components/nav/bottom-nav.tsx`): 2 tabs (Clients, Settings). Hidden on `/clients/new` and any `/intake/edit` route. Also hidden when the keyboard is open.
- **Page header** (`src/components/nav/page-header.tsx`): title + optional back arrow + optional actions slot.

---

## File layout

```
Training-clients/
├── .env.local                   gitignored. Contains DATABASE_URL only.
├── .env.example                 (not yet created — TODO)
├── .nvmrc                       Node major: 22
├── next.config.mjs              Minimal. No experimental flags.
├── tailwind.config.ts           Theme tokens.
├── tsconfig.json                Strict mode on.
├── components.json              shadcn config.
├── package.json                 Includes postinstall + prebuild for PDF.js worker.
├── pnpm-lock.yaml               COMMITTED — source of truth.
├── public/
│   ├── manifest.webmanifest
│   ├── icons/                   PWA install icons
│   └── pdf.worker.min.mjs       Gitignored. Generated by scripts/copy-pdf-worker.mjs.
├── scripts/
│   └── copy-pdf-worker.mjs      Copies pdfjs-dist worker into public/ on install + build.
├── drizzle/
│   ├── 0000_dapper_wildside.sql    Initial schema (8 tables).
│   ├── 0001_curious_mojo.sql       Intake form additions (client_intake table + 13 client cols + 3 body_stats cols).
│   ├── 0002_broad_excalibur.sql    Multi-select conversion (7 columns text/integer → text[]/integer[]).
│   └── meta/                       Drizzle internal state.
└── src/
    ├── app/
    │   ├── layout.tsx           Root layout with theme provider, viewport meta.
    │   ├── globals.css          Tokens, custom utilities, base styles.
    │   ├── error.tsx            Root error boundary.
    │   ├── page.tsx             Redirects to /clients.
    │   └── (app)/
    │       ├── layout.tsx       Bottom-nav layout.
    │       ├── error.tsx        Route-group error boundary (added in Phase 2).
    │       ├── clients/
    │       │   ├── page.tsx           Client list home.
    │       │   ├── loading.tsx        Skeleton.
    │       │   ├── new/page.tsx       New client (intake form + side-by-side viewer).
    │       │   └── [id]/
    │       │       ├── page.tsx       Client detail (sectioned).
    │       │       ├── loading.tsx
    │       │       ├── edit/page.tsx  Basic info edit (name/email/phone).
    │       │       ├── intake/edit/page.tsx   Full intake form, pre-filled, for resume.
    │       │       ├── goals/page.tsx
    │       │       ├── nutrition/page.tsx
    │       │       └── stats/
    │       │           ├── page.tsx   Body stats per client + chart.
    │       │           └── loading.tsx
    │       └── settings/page.tsx     Theme toggle, version.
    ├── components/
    │   ├── ui/                  shadcn primitives: button, input, label, textarea, section-label.
    │   ├── nav/                 bottom-nav, page-header.
    │   ├── clients/             client-list-card, hero-card, section-block, client-form, client-initials-avatar.
    │   ├── goals/               goal-toggle-row, delete-goal-button, goals-form.
    │   ├── nutrition/           nutrition-form, delete-nutrition-button.
    │   ├── stats/               weight-chart.
    │   ├── intake/              The big one. See below.
    │   ├── install-banner.tsx   iOS PWA install prompt.
    │   └── skeleton.tsx         Loading-state primitive.
    ├── components/intake/
    │   ├── fields/                            Reusable form primitives.
    │   │   ├── field-label.tsx
    │   │   ├── text-field.tsx
    │   │   ├── yes-no-field.tsx
    │   │   ├── single-select-field.tsx
    │   │   ├── multi-select-field.tsx
    │   │   ├── scale-field.tsx
    │   │   └── conditional-reveal.tsx
    │   ├── sections/                          One per questionnaire section (9 sections + acknowledgment).
    │   │   ├── section-1-personal.tsx
    │   │   ├── section-2-logistics.tsx
    │   │   ├── section-3-goals.tsx
    │   │   ├── section-4-history.tsx
    │   │   ├── section-5-preferences.tsx
    │   │   ├── section-6-health.tsx
    │   │   ├── section-7-lifestyle.tsx
    │   │   ├── section-8-nutrition.tsx
    │   │   ├── section-9-final.tsx
    │   │   └── section-acknowledgment.tsx
    │   ├── intake-form.tsx                    FormProvider + RHF + zodResolver + sticky submit bar.
    │   ├── intake-section-card.tsx            Section wrapper UI.
    │   ├── intake-with-viewer.tsx             Responsive layout: iPad side-by-side, phone overlay.
    │   ├── questionnaire-viewer.tsx           File drop zone + viewer routing + header controls.
    │   └── pdf-renderer.tsx                   react-pdf wrapper with pinch-zoom + rotate + page indicator.
    ├── db/
    │   ├── index.ts             Lazy Drizzle client via @neondatabase/serverless. Throws if DATABASE_URL unset at runtime.
    │   └── schema.ts            All 9 tables. Source of truth.
    ├── hooks/
    │   ├── use-keyboard-inset.ts    Tracks window.visualViewport for keyboard-aware bottom bars.
    │   └── use-body-scroll-lock.ts  Locks body overflow when modals open.
    ├── lib/
    │   ├── utils.ts             cn() classname helper, relativeDays() formatter.
    │   ├── schemas/
    │   │   ├── client-intake.ts     The big Zod schema. Single source of truth for the intake form.
    │   │   ├── client.ts            Smaller schemas for the basic-edit form.
    │   │   ├── goals.ts
    │   │   ├── body-stats.ts
    │   │   └── nutrition.ts
    │   ├── actions/             All server actions.
    │   │   ├── clients.ts
    │   │   ├── goals.ts
    │   │   ├── body-stats.ts
    │   │   ├── nutrition.ts
    │   │   └── intake.ts        createClientFromIntake + updateClientFromIntake + shared column-mapping helpers.
    │   ├── queries/clients.ts   Read-side queries: listClients, getClientDetail, getNextSessionAcrossClients, getWeekSummary.
    │   └── intake-defaults.ts   Maps DB row → form defaults for the resume-intake page.
    └── types/                   Module declarations.
```

---

## Architectural decisions (and why)

1. **Single Zod schema, not separate client/server validation.** `src/lib/schemas/client-intake.ts` is imported by both the form (via `zodResolver`) and the server action (via `intakeFormSchema.parse(raw)`). One source of truth. Output type is what the action receives.

2. **DB client is lazy.** `src/db/index.ts` uses a Proxy that only constructs the Drizzle instance on first query. This makes `next build` succeed even when `DATABASE_URL` isn't set (which Vercel's build environment sometimes does). At runtime, missing `DATABASE_URL` throws a descriptive error.

3. **HTTP driver, not WebSocket, for Neon.** `@neondatabase/serverless` has both. We use `neon()` (HTTP) because it works in Vercel's serverless functions without extra config. WebSocket driver has limits we don't need.

4. **`disableWorker: true` on PDF.js** in `src/components/intake/pdf-renderer.tsx`. PDF.js's web worker had compatibility issues with Vercel's MIME types for `.mjs` files. Main-thread rendering is slower for very long PDFs (50+ pages) but the trainer's intake PDFs are 5–10 pages — imperceptible.

5. **pdfjs-dist pinned to 5.4.296** because react-pdf@10.4.1 was built against that version. The default pnpm hoisting picked up a newer 5.7.x version and silently broke rendering (canvas painted blank). Lesson: when using react-pdf, pin pdfjs-dist explicitly.

6. **PDF worker copied to public/ via postinstall.** The `?url` import trick that some bundlers support doesn't work in Next.js's bundler. So `scripts/copy-pdf-worker.mjs` runs on both `postinstall` AND `prebuild`, copying `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` to `public/pdf.worker.min.mjs`. The file is `.gitignored` because it's regenerated.

7. **Multi-select fields store as Postgres arrays** (`text[]`, `integer[]`). The schema and form match. Empty arrays write as `NULL` for cleaner downstream filtering (`parsed.field?.length ? parsed.field : null`).

8. **Bottom nav has only 2 tabs: Clients and Settings.** The original plan had 4 (Clients, Sessions, Stats, Settings). The trainer requested removing Sessions and Stats — those became sections inside the per-client detail page. The standalone `/sessions` and `/stats` routes were deleted.

9. **Required-field validation was almost entirely removed.** Only `name` is still required. The trainer reported that real clients often don't answer every question, and forcing required fields blocked saving partial info. Now: save with whatever you have, resume later via `/clients/[id]/intake/edit`.

---

## Privacy / security posture

- **No auth yet.** The deployed app is publicly accessible to anyone who knows the URL. This was an explicit tradeoff for shipping speed. Auth was the planned final milestone.
- **No client data leaves the browser unless intentionally saved.** The questionnaire PDF viewer (`QuestionnaireViewer` + `PdfRenderer`) keeps the uploaded file in memory only — never uploaded to a server, never written to localStorage / IndexedDB, evaporates on tab close.
- **Server action errors are mapped to user-friendly strings.** Raw DB exception messages (e.g., constraint names) are console.error'd on the server but never returned to the client. Only `intake.ts` does this currently; `goals.ts`, `body-stats.ts`, `nutrition.ts`, `clients.ts` still leak raw exceptions if they throw (a known follow-up).
- **`.env.local` is gitignored.** `DATABASE_URL` lives there locally and in Vercel env vars (Production + Preview + Development).
- **No `trainer_id` column on tables.** A single-user app — adding multi-tenancy was deferred until needed.

---

## What the trainer cares about (cultural context)

- Wants the app working **for real clients ASAP**.
- Strongly prefers **verifying before deploying**: typecheck, lint, build, agent-verified review.
- Has been burned by mistakes — explicitly told us to operate with "extreme precision."
- Communicates in plain English, often via screenshots from iPad Safari.
- Will explicitly say "push" when they want a deploy. Otherwise: stage locally, run verification, present an analysis, wait for approval.
- Wants short, scannable replies (2–3 sentences per section).
- Has a separate book-tracker webapp that we visually mirror.
- Privacy of client data matters to them; AI processing was explicitly declined in favor of manual entry.
