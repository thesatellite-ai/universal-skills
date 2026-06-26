# satl-context-handoff — purpose & use case

## Why this skill exists

After a multi-step task — a migration, a deployment, a refactor, an investigation — most of the value lives in the operator's head: the exact paths, the gotchas hit, the order things had to happen in, what was deliberately *not* touched. Hand the task to a fresh agent (or a human) with no conversation history and they re-discover all of it the hard way, repeating the same traps.

`satl-context-handoff` turns everything you did and learned into **one self-contained document** so that handing over that single file is enough to continue, reverse, or repeat the work with zero knowledge loss.

## What it does

Produces a handoff doc optimized for "nothing is missed," not for brevity. It:

- **Gathers real values** from the source of truth (reads files, runs read-only commands) instead of guessing paths/ports/names.
- **Marks verified vs assumed** so the next agent knows which facts are load-bearing.
- **Captures the failures, not just the happy path** — the gotchas, their root cause, and the fix are the most valuable section.
- **States boundaries honestly** — what was NOT done / NOT accessible, so no one assumes work that didn't happen.
- Structures it: who-I-am, TL;DR, environment, inventory tables, credentials (behind a secrets warning), per-component mechanics, the procedure, gotchas & fixes, what's still open, rollback/repeat, command cheat-sheet, locations.

## When to use it

- **"Create a full context" / "write a handoff doc" / "document everything you did."**
- **"Create a runbook"** or "so the next agent misses nothing."
- At the end of any multi-step task worth capturing.

## Quality bar

The doc passes only if a brand-new agent, given **only this file** and no chat history, could resume the work, undo it, or run it again on a new target — and would hit none of the gotchas you already hit.
