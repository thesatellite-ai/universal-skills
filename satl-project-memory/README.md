# satl-project-memory — purpose & use case

## Why this skill exists

Every AI coding session rediscovers the same things. Why the auth cookie is set the way it is. Which approach was already tried and abandoned. The upstream bug that a weird-looking workaround exists for. That knowledge is produced constantly and stored nowhere — it lives in a chat window that closes, and the next session pays for it again.

The usual fixes don't hold. A `CLAUDE.md` is for rules that are always true, so it can't absorb dated, situational learnings without bloating past the point anyone reads it. A handoff doc covers one task and stops. A transcript log records everything, which means nothing is findable.

`satl-project-memory` gives a project an actual memory: small, dated, immutable **chunks** in `.ai/memory/`, plus two indexes that make the right chunk surface at the right moment.

## What it does

**Write** — when a session produces something a future session would waste real time rediscovering, it captures one chunk: what, **why**, how, the evidence, and the thing that looks right but isn't. One learning per chunk, filed under today's date, never rewritten afterwards.

**Recall** — three escalating steps, cheapest first:

1. **Session start** — read `INDEX.md` only. One row per chunk, always affordable.
2. **Before editing a file** — grep `FILES.md` for that path and read the chunks it names. This is the moment memory is worth the most, and the one most memory systems miss entirely.
3. **On a "why is this like this?" question** — search tags and titles, answer citing the chunk id.

## The store

```
.ai/memory/
  INDEX.md                 # generated — newest-first, one row per chunk
  FILES.md                 # generated — reverse index, path -> chunk ids
  2026-08-06/
    01-vite-hmr-symlink-drop.md
    02-auth-cookie-samesite-decision.md
```

Chunks are plain markdown with frontmatter (`id`, `date`, `type`, `tags`, `files`, `status`, `confidence`, `supersedes`, `until`). Types: `decision`, `gotcha`, `convention`, `state`, `failed-attempt`, `map`, `external`. Committed to git — memory that vanishes on a fresh clone isn't memory.

## What keeps it from rotting

- **Immutable + supersede** — a chunk is never rewritten; a correction is a new chunk with `supersedes:`, and the old one is marked `superseded`. That's why the store stays trustworthy.
- **Compact** — once a topic passes roughly seven chunks, a `type: map` roll-up becomes its entry point. Raw chunks stay.
- **Promote** — a chunk that has held true across sessions and applies to all future work graduates into `CLAUDE.md` as a rule, and leaves memory.
- **A high bar for writing** — noise isn't neutral here. Anything `git log` already says, task status, or session narration is explicitly excluded, because every junk chunk dilutes the index that every future session reads.

## Optional tooling

`project-memory` is a dependency-free bash helper — the store is hand-maintainable by design, and nothing about the skill requires the script.

```bash
project-memory init                    # create the store
project-memory new gotcha "HMR drops symlinked packages"
project-memory index                   # regenerate INDEX.md + FILES.md
project-memory check                   # non-zero exit if the indexes drifted (CI)
project-memory find redis              # recall by term
project-memory files vite.config.ts    # recall by path
```

`task test` runs the behavioral suite in an isolated temp tree.

## How it fits with the neighbours

- **`satl-session-os`** decides *when* bookkeeping must happen; this skill is the store it writes into. Use both.
- **`satl-persist-context`** is where durable rules go once they graduate out of memory.
- **`satl-context-handoff`** is a one-shot doc for resuming one task; this is the accumulating store across all of them.

## When to use it

Any project you'll work on across more than one session. Triggers on "remember this", "log what we did", "save this for next session", "what do we know about X", "why is it like this" — and on any session that produces a decision, a root-caused bug, a workaround, an abandoned approach, or a correction.
