# satl-replay-checklist — purpose & use case

## Why this skill exists

Standing up a project eats hours or days, and most of that time is **discovery** — hitting bugs, choosing between options, finding the right CLI flag, wiring the deploy. None of that survives in the code or git history in a form that stops a future-them from redoing the exact same discovery on the next, similar project.

`satl-replay-checklist` is a session-to-playbook compressor: it captures the non-obvious, replayable knowledge from a session into a single markdown checklist that the user (or another agent) can open at the start of a sister project and tick through — so the next bring-up takes hours instead of days.

## What it does

Distills the session into a **project-type playbook**, not a session log:

- Each item is concrete — real file paths, real commands, real env var names.
- Each gotcha names the symptom, root cause, and fix.
- Each section ends with verification commands.

It ships reference outputs in `./EXAMPLES/` and copies the *shape* of the closest one (section count, gotcha format, verification block); the content always comes from the current session, never the examples.

It **asks where to save** (never hardcodes a path), derives or asks for a topic slug (`<TOPIC>_RECURRING_TASKS.md`), and if a matching file already exists it **updates** rather than duplicating.

## When to use it

- End of a substantial project bring-up — "make me a checklist so the next one is faster."
- After a multi-hour debugging marathon where a class of bug surfaced repeatedly.
- Before context-window pressure, to persist the load-bearing learnings.
- The user says "I keep doing this redundant thing" / "replay this on the next project."

## NOT for

- One-off bug fixes with no reusable pattern (just commit the fix).
- Mid-task — defer until the user is wrapping up.
- A topic that already has a recent checklist and this session added nothing new (offer to update it instead).
