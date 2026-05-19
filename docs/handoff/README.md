# Handoff documents

These four files exist to bring a fresh Claude session (or any new collaborator) fully up to speed on this project. Read them in order:

1. **`1-project-overview.md`** — what we're building, tech stack, design system, file layout, architectural decisions, privacy posture.
2. **`2-current-state.md`** — what's live and working right now, recent commits, known gotchas, and (most importantly) the *"Where we paused and what's next"* section.
3. **`3-development-workflow.md`** — git practices, Vercel pipeline, Neon migration flow (with its constraints), env vars, scripts, verification process, and the trainer's working-style preferences.
4. **`4-roadmap.md`** — original 4-milestone plan, what's deferred (and why), things explored and rejected, open questions the trainer hasn't decided yet.

## For a fresh Claude session

Open the new session against this repo on the `claude/trainer-pwa-setup-gLrMY` branch, then tell Claude:

> Read `docs/handoff/1-project-overview.md`, `docs/handoff/2-current-state.md`, `docs/handoff/3-development-workflow.md`, and `docs/handoff/4-roadmap.md` in that order. Then summarize where we left off and confirm you're caught up before I give my next instruction.

That's it. No file uploads needed.
