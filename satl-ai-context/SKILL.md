---
name: satl-ai-context
description: >-
  Generate a CLAUDE.md (AI context file) for a codebase so a fresh agent
  session can work without verbal explanation. Use when the user says
  "write/generate CLAUDE.md", "create the AI context file", "document this
  project for the agent", "/init"-style bootstrap of agent context.
---

# satl-ai-context

Analyze the project and write a `CLAUDE.md` at the repo root. It is read
automatically at session start — write it for the AI, not for humans browsing
GitHub. Include internal details.

## Required sections

- **What this project is** — one specific paragraph.
- **Build and test** — exact commands.
- **Project structure** — key directories and what's in each.
- **Pipeline / architecture** — how data flows (simple diagram).
- **Key types / data model** — main types, purpose, important fields.
- **How main features work** — code path per feature: which files, which
  functions.
- **What's implemented** — bullet list.
- **What's NOT implemented** — bullet list (prevents the agent assuming
  features exist).
- **Testing** — how to run, what kind, where fixtures are.
- **Conventions** — patterns/naming/style not obvious from code.

## Rules

- Specific, not generic: actual type names, function names, file paths.
- Under 300 lines. Link to docs for deep dives.
- Internal detail is wanted — this is for the agent.
- Explicitly list what does NOT exist. The agent assumes features exist
  unless told otherwise; the absence list is the highest-value section.
