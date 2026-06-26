# satl-session-os — purpose & use case

## Why this skill exists

A project can have a perfectly good session/decision/incident log system (a `.ai/` logs dir, a logging skill) and still get no value from it — because logging only happens when someone remembers to invoke it manually, and in practice no one does. Sessions end up invisible to future sessions: corrections, decisions, and mistakes vanish the moment the chat closes.

`satl-session-os` runs that bookkeeping discipline like an OS in the background, so the user never has to ask for it.

## What it does

In any repo that has a session-logging system, it auto-fires on the moments that matter:

- **Session start** — open/append the session log as the FIRST action.
- **User corrects you** — log the correction immediately.
- **Non-obvious decision** — record it with rationale.
- **You made a mistake** — self-report it to the incident log; don't hide it.
- **Task start / done** — mark it.
- **"remember" / "learn" / "don't forget"** — capture immediately.
- **Context running low** — write a continuation/state file.
- **Session ending** — close the session log as the LAST action.

If the project designates a specific logging skill/command, it defers to that — this skill enforces only the *discipline* of always running it.

## The non-negotiable

Session-start and session-end logging are mandatory. Without them the session is invisible to every session that follows.

## When to use it

In any repo with a session/decision/incident log system. Triggers on session start, user correction, non-obvious decision, a mistake, task start/done, session end, and "remember / learn / don't forget."
