---
name: satl-persist-context
description: >-
  Persist this session's context so a fresh session loses nothing. Use when
  the user says "save context", "update memory/CLAUDE.md before we end",
  "persist what we learned", "don't lose this for next time", or a session is
  wrapping up with undocumented decisions/conventions/state.
---

# satl-persist-context

Update persistent rules/memory so a fresh session won't lose context from this
one. Do all four, then show diffs before the user confirms.

1. **Project rules** — append/update `CLAUDE.md` (or `AGENTS.md`/equivalent)
   with conventions, gotchas, or decisions hit this session that future-you
   would need. Specific, not generic.
2. **Memory** — update auto-memory (`MEMORY.md` + per-topic files) for: user
   preferences, feedback corrections, project state, external references.
3. **Changelog** — update `CHANGELOG.md` (or equivalent) with what changed
   this session.
4. **Review gate** — show a diff of every file touched and wait for explicit
   confirmation before considering it done.

Rules: capture what was *non-obvious* — do not restate what the code or git
history already says. One fact per memory entry. Convert relative dates to
absolute.
