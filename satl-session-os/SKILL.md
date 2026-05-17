---
name: satl-session-os
description: >-
  Run a session-bookkeeping discipline in the background so sessions are never
  invisible. Use in any repo that has a session/decision/incident log system
  (e.g. a .ai/ logs dir or a logging skill). Triggers: session start, user
  correction, non-obvious decision, a mistake, task start/done, session end,
  "remember/learn/don't forget".
---

# satl-session-os

If the project has a session-logging system (a `.ai/` logs dir, or a logging
skill the project designates), run it like an OS in the background — the user
should not have to invoke it manually.

## Auto-triggers

- **Session start** — open/append the session log as the FIRST action.
- **User corrects you** — log the correction immediately (don't wait to be
  asked).
- **Non-obvious decision** — record it with rationale.
- **You made a mistake** — self-report it to the incident log; do not hide it.
- **Task start / done** — mark it.
- **"remember" / "learn" / "don't forget"** — capture immediately.
- **Context running low** — write a continuation/state file.
- **Session ending** — close the session log as the LAST action.

## Non-negotiable

Session-start and session-end logging are mandatory. Without them the session
is invisible to future sessions. If the project designates a specific logging
skill/command, defer to it; this skill only enforces the *discipline* of
always running it.
