# satl-persist-context — purpose & use case

## Why this skill exists

A session ends and the non-obvious things it produced — a convention decided mid-task, a gotcha hit and worked around, the current state of the work — live only in the chat transcript. The next session starts blind and re-learns them. The persistent surfaces that *would* carry that context (`CLAUDE.md`, memory, changelog) only help if they're actually updated before the session closes.

`satl-persist-context` is the wrap-up pass that writes this session's context into those surfaces so a fresh session loses nothing.

## What it does

Does all four, then shows diffs before the user confirms:

1. **Project rules** — append/update `CLAUDE.md` (or `AGENTS.md`/equivalent) with conventions, gotchas, or decisions hit this session.
2. **Memory** — update auto-memory (`MEMORY.md` + per-topic files) for user preferences, feedback corrections, project state, external references.
3. **Changelog** — update `CHANGELOG.md` with what changed this session.
4. **Review gate** — show a diff of every file touched and wait for explicit confirmation.

It captures what was **non-obvious** — never restating what the code or git history already says — keeps one fact per memory entry, and converts relative dates to absolute.

## When to use it

- "Save context" / "persist what we learned" / "don't lose this for next time."
- "Update memory / CLAUDE.md before we end."
- A session is wrapping up with undocumented decisions, conventions, or state.
