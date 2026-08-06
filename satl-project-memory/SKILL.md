---
name: satl-project-memory
description: >-
  Maintain a durable, dated, chunked memory store for a project so every new AI
  session starts with what past sessions learned — what was done, how, and above
  all why. Use when the user says "remember this", "log what we did", "save this
  for next session", "what do we know about X", "why is it like this", "build
  memory from this session", "harvest this chat", "log everything we learned
  today", or when a session produces a decision, a root-caused bug, a workaround,
  or a correction worth keeping. Writes immutable chunks to .ai/memory/ and keeps
  INDEX.md + FILES.md so recall fires at the moment of relevance, not just at
  session start.
---

# satl-project-memory

A project's hard-won knowledge dies at the end of each chat. This skill gives it a home: an append-only store of small, dated, self-contained **memory chunks** plus two indexes that make them findable.

Two halves, and the second one is the product:

- **Write** — capture a chunk the moment something non-obvious is learned.
- **Recall** — pull the *relevant* chunks before touching code, without loading the whole store.

## Store layout

```
.ai/memory/
  INDEX.md                 # newest-first, one row per chunk — the session-start read
  FILES.md                 # reverse index: file/dir path -> chunk ids
  2026-08-06/
    01-vite-hmr-symlink-drop.md
    02-auth-cookie-samesite-decision.md
  2026-08-11/
    01-dropped-redis-queue.md
```

Rules that make this work:

- **Chunks are immutable.** Once written, a chunk's body is never rewritten. Wrong or outdated → write a new chunk with `supersedes:` and flip the old one's `status:` to `superseded`. That one field flip is the only permitted edit.
- **Chunk id is `YYYY-MM-DD-NN`**, `NN` zero-padded per day. The filename is `NN-<slug>.md` inside the date dir.
- **Committed to git**, not ignored — memory that vanishes on a fresh clone is not memory.
- **Plain markdown.** No component grammar, no runtime, no database. If a project renders `.ai/**` with a doc system, that's fine — chunks stay plain so any agent in any repo can read them.

## Chunk format

```markdown
---
id: 2026-08-06-01
date: 2026-08-06
type: gotcha
title: Vite HMR silently drops updates for symlinked workspace packages
tags: [vite, monorepo, hmr]
files: [vite.config.ts, packages/ui/]
status: active
confidence: high
supersedes:
until:
---

**What** — HMR never fires for edits inside `packages/ui` when it is linked into the app via a workspace symlink; the page just goes stale with no error.

**Why** — Vite's watcher does not follow symlinks by default, so the file events land on a path outside the watched root and get discarded. This is upstream behaviour, not a config mistake.

**How** — Add `server.watch.followSymlinks: true` plus `resolve.preserveSymlinks: false` in `vite.config.ts:22`. Restart is required; HMR alone does not pick up the config change.

**Evidence** — Reproduced by editing `packages/ui/src/Button.tsx` with `DEBUG=vite:hmr` set: no `hmr update` line emitted. Fix verified on the same repro.

**Don't** — Don't "fix" it by importing from the built `dist/` output. That makes HMR appear to work while silently serving stale compiled code, which is a worse failure than no HMR.
```

### Field meanings

| Field | Meaning |
|---|---|
| `type` | `decision` · `gotcha` · `convention` · `state` · `failed-attempt` · `map` · `external` |
| `tags` | free-form topic words — how humans search |
| `files` | every path this chunk is about; **this is what feeds `FILES.md`** and makes recall fire at the right moment |
| `status` | `active` · `superseded` · `expired` |
| `confidence` | `high` (verified) · `medium` (worked once) · `speculative` (hypothesis, not yet proven) |
| `supersedes` | chunk id this replaces, if any |
| `until` | expiry condition for temporary workarounds, e.g. `upstream vite#12345 lands` |

### Body sections

`What` · `Why` · `How` · `Evidence` · `Don't`. Never omit **Why** and **Don't** — those are the two a future session cannot re-derive from the code. `What` alone is usually re-derivable and is the least valuable line in the chunk.

## Write protocol

Write a chunk when, and only when, a future session would waste more than ~15 minutes rediscovering it:

- a decision was made and there was a real alternative (record the alternative and why it lost)
- a bug was root-caused (the cause, not the symptom)
- the user corrected you, or corrected an assumption the code implies
- a workaround was applied that looks wrong without its reason
- an approach was tried and abandoned — **failed attempts are high-value**; they stop the next session repeating the experiment
- you built a mental map of an unfamiliar subsystem (`type: map`)

Do **not** write a chunk for: anything `git log` or `git blame` already says, task status (that belongs in `TASKS.md`), the code's structure (that belongs in `CLAUDE.md`), or a narration of what happened this session. Noise here is not neutral — it dilutes the index every future session reads.

Steps:

1. Pick or create today's date dir; take the next `NN`.
2. Write the chunk file with full frontmatter.
3. Append one row to `INDEX.md` (newest first, at the top of the table).
4. Add or extend the rows in `FILES.md` for every path in `files:`.

One learning per chunk. If you're writing "and also…", that's a second chunk.

## Harvest mode — building memory from a whole session

The write protocol above fires chunk-by-chunk as things happen. **Harvest mode** is the other entry point: sweep an entire conversation at once and extract everything worth keeping. Trigger phrases: *"build memory from this session"*, *"harvest this chat"*, *"go through our conversation and save what matters"*, *"log everything we learned today"*.

Run it end-of-session, before a context compaction, or any time the user asks. Procedure:

1. **Sweep the conversation start to finish** — the whole thing, not just the recent turns. Most keepers happen mid-session and are forgotten by the end.
2. **List candidates before writing any file.** For each, note which write-protocol trigger it hits (decision with a real alternative, root-caused bug, correction, workaround, abandoned approach, subsystem map). Anything that fits none of those is not a candidate.
3. **Apply the bar to each candidate**, out loud: would a future session waste more than ~15 minutes rediscovering this? Drop everything else. A typical session yields 1–4 chunks. Ten chunks from one session means the bar slipped.
4. **Dedupe against the existing store** — read `INDEX.md` first. If a chunk already covers it, either skip it or write a superseding chunk; never file a near-duplicate.
5. **Show the user the shortlist and get a yes** before writing. They know which decisions were real and which were thinking-out-loud; you don't.
6. **Write each approved chunk**, then regenerate the indexes.

What to harvest, specifically — a session's highest-value residue is rarely the code that shipped:

- **decisions with a loser** — what was chosen, what was rejected, and why the rejected one lost
- **corrections the user made** — these encode taste and constraints that appear nowhere in the repo
- **bugs whose cause was non-obvious** — the mechanism, not the diff
- **things tried that failed** — the single most under-captured category, and the one that saves the most time
- **constraints discovered about the environment** — an API's real behaviour, a tool's quirk, a limit you hit

What to leave out: what got built (the diff says it), what order you did it in, tasks and their status, and any summary of the session as an event. Memory is about what's *true*, not what *happened*.

## Recall protocol

This is the half that pays for the other half. Recall in three escalating steps, cheapest first:

1. **Session start** — read `INDEX.md` only. It is one row per chunk; it should stay small enough to always afford. Nothing else is loaded yet.
2. **Before editing any file or subsystem** — grep `FILES.md` for that path (and its parent dir), then read the chunks it names. This is the highest-value moment for memory to fire, and the one most memory systems miss.
3. **On a "why is this like this?" / "what do we know about X?" question** — grep the store for tags and title words, read the matching chunks, and answer with the chunk id cited.

When answering from memory, always cite the chunk id, and always state a chunk's `confidence` if it is not `high`. A `speculative` chunk presented as fact is worse than no chunk.

## Lifecycle — otherwise the store rots

- **Supersede, never delete.** New chunk gets `supersedes: <old-id>`; old chunk's `status:` becomes `superseded`. History is why the store is trustworthy.
- **Expire.** A chunk with `until:` gets checked when its area is next touched; if the condition is met, flip `status: expired` and note it in the superseding chunk.
- **Compact.** When one topic accumulates roughly 7+ chunks, write a `type: map` roll-up chunk that summarises them and links their ids. Raw chunks stay — the roll-up is an entry point, not a replacement.
- **Promote.** A chunk that has held true across several sessions and applies to *all* future work is no longer memory, it's a rule: promote it into `CLAUDE.md` (hand off to `satl-persist-context`) and mark the chunk `status: superseded` with a pointer to the rule.

## Bootstrapping an existing project

Do not backfill history. Create `.ai/memory/` with an empty `INDEX.md` and `FILES.md`, add a pointer line in `CLAUDE.md` ("Project memory lives in `.ai/memory/` — read `INDEX.md` at session start; grep `FILES.md` before editing a file"), and start capturing from today. A store built from real sessions is trusted; one hallucinated from git history is not.

## The `project-memory` command

A dependency-free bash helper ships next to this `SKILL.md`. **It is optional** — the store is plain markdown, so every command below has a hand-editing equivalent, and the skill works identically without the script. Its only job is the mechanical part: allocating the next chunk id and regenerating the two indexes.

### Making it runnable

The script lives at `<skill-dir>/project-memory`. Either call it by full path, or symlink it onto `PATH` once:

```bash
ln -sfn ~/.claude/skills/satl-project-memory/project-memory ~/.local/bin/project-memory
project-memory help          # confirms it is on PATH
```

If `~/.local/bin` isn't on your `PATH`, use any directory that is (`echo $PATH | tr ':' '\n'`).

### Every command

Run these **from inside the project** whose memory you're touching — the store is located by walking up from the current directory to the nearest `.ai/memory/`.

| Command | What it does |
|---|---|
| `project-memory init` | Create `.ai/memory/` with empty `INDEX.md` + `FILES.md`. Once per project. |
| `project-memory new <type> "<title>"` | Create today's next chunk from the template and print its path. Then open that file and fill in the body + `tags:` + `files:`. |
| `project-memory index` | Rebuild `INDEX.md` and `FILES.md` from every chunk's frontmatter. Run after writing or editing chunk frontmatter. |
| `project-memory check` | Exit non-zero if the indexes had drifted (it also fixes them). For CI or a pre-commit hook. |
| `project-memory find <term>` | Print `id` + `title` for every chunk matching a term. Case-insensitive. |
| `project-memory files <path>` | Print the chunks that name a given file path. |
| `project-memory help` | The same list, from the shell. |

`<type>` is one of: `decision` `gotcha` `convention` `state` `failed-attempt` `map` `external`.

### A full first run

```bash
cd ~/code/my-project
project-memory init
project-memory new gotcha "HMR drops symlinked packages"
# -> .ai/memory/2026-08-07/01-hmr-drops-symlinked-packages.md
#    open it, write What/Why/How/Evidence/Don't, and fill in tags: + files:
project-memory index
git add .ai/memory && git commit -m "memory: HMR symlink gotcha"
```

Then add the pointer line to that project's `CLAUDE.md` (see *Bootstrapping* above) so future sessions read the store without being asked.

### Notes

- **`MEMORY_DIR`** overrides store location for one invocation — used by the test suite, rarely needed otherwise.
- **`task test`** (in the skill dir) runs the behavioral suite in an isolated temp tree; it never touches a real store.
- **Editing a chunk's frontmatter by hand is fine** — just run `project-memory index` afterwards, or let `check` catch the drift.

## Relationship to neighbouring skills

- **`satl-session-os`** is the *trigger* layer — it decides when bookkeeping must happen. This skill is the *storage and recall* layer it writes into. Use both together.
- **`satl-persist-context`** is the promotion target — durable, always-true rules graduate out of memory into `CLAUDE.md`.
- **`satl-context-handoff`** is a one-shot, self-contained doc for resuming one specific task. This skill is the accumulating store across all tasks. Different jobs; a handoff doc may cite chunk ids.
