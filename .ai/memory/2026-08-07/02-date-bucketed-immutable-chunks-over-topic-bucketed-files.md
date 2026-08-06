---
id: 2026-08-07-02
date: 2026-08-07
type: decision
title: Date-bucketed immutable chunks over topic-bucketed files
tags: [satl-project-memory, architecture, storage]
files: [satl-project-memory/SKILL.md, satl-project-memory/project-memory]
status: active
confidence: high
supersedes:
until:
---

**What** — The memory store writes append-only chunks to `.ai/memory/YYYY-MM-DD/NN-slug.md` and never rewrites them. The rejected alternative was topic-bucketed files (`.ai/memory/auth/session-cookies.md`) updated in place.

**Why** — Topic-bucketing recalls better on its own, but it loses on the two operations that happen most. Every write needs a "does a file for this topic already exist, and where?" lookup, which makes capture expensive enough that it gets skipped. And updating in place churns the file's history, so a chunk's git log stops being evidence of when something became true. Date-bucketing makes writes O(1) and append-only, and recovers the recall advantage with a generated reverse index (`FILES.md`) instead of with the directory layout. Immutability is what makes the store trustworthy: a superseded chunk is still readable next to the one that replaced it.

**How** — `project-memory new` allocates `YYYY-MM-DD-NN` and writes into today's dir. `project-memory index` derives `INDEX.md` (newest-first, one row per chunk) and `FILES.md` (path -> chunk ids) from chunk frontmatter, so the recall layout is generated rather than maintained. Corrections use `supersedes:` plus a `status:` flip on the old chunk — that single field flip is the only edit an existing chunk ever gets.

**Evidence** — Both layouts were written out and compared during the design pass before any code existed; the write-cost and history-churn arguments are what decided it. The generated-index approach was then validated by the test suite (41 tests), including that two chunks naming the same path collapse to one `FILES.md` row.

**Don't** — Don't "improve" this by consolidating chunks into per-topic files. It reads like an obvious cleanup and it silently removes the two properties the store is built on: cheap capture and immutable history. If a topic genuinely has too many chunks, the intended answer is a `type: map` roll-up chunk that links them, leaving the raw chunks in place.
