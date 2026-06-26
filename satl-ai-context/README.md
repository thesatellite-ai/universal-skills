# satl-ai-context — purpose & use case

## Why this skill exists

A fresh agent session opens a repo knowing nothing — it has to re-derive what the project is, how to build it, where things live, and (worst of all) it assumes features exist that don't. Explaining all that verbally every session is slow and lossy. The fix is a `CLAUDE.md` at the repo root that the agent reads automatically at session start, written *for the AI* rather than for humans browsing GitHub.

`satl-ai-context` generates that file.

## What it does

Analyzes the project and writes a `CLAUDE.md` covering the sections an agent actually needs: what the project is, exact build/test commands, project structure, the architecture/data-flow, key types and data model, the code path for each main feature, what's implemented, what's **not** implemented, testing, and non-obvious conventions.

The highest-value section is the explicit **"what does NOT exist"** list — because an agent assumes a feature is present unless told otherwise, naming the absences prevents whole classes of wrong assumptions.

## When to use it

- **"Write / generate CLAUDE.md."**
- **"Create the AI context file"** / "document this project for the agent."
- A `/init`-style bootstrap of agent context for a repo that has none.

## Rules it follows

- Specific, not generic — real type names, function names, file paths.
- Under 300 lines; links out for deep dives.
- Internal detail is wanted (this is for the agent, not a public doc).
