---
id: 2026-08-07-01
date: 2026-08-07
type: gotcha
title: Empty files list aborted project-memory index under set -e
tags: [bash, set-e, project-memory]
files: [satl-project-memory/project-memory, satl-project-memory/test.sh]
status: active
confidence: high
supersedes:
until:
---

**What** — `project-memory index` silently truncated `INDEX.md` whenever any chunk had an empty `files: []` list, losing every row.

**Why** — The reverse-index collection loop used `[ -n "$f" ] && printf ...` as the last statement in a `while` body. On an empty list the test is false, so the loop body's exit status is 1, so the whole `while` returns 1 — and under `set -e` that aborts the script mid-write, after the header has been written but before any rows.

**How** — Replaced with an `if` block in the `cmd_index` collection loop in `satl-project-memory/project-memory`. A false `if` test yields status 0, so the loop finishes normally.

**Evidence** — Test "check self-heals, so the next run passes" failed with want 0 / got 1. Reproduced directly: `project-memory init && project-memory new gotcha one && project-memory index` printed no `wrote ...` line at all, proving early exit rather than bad output.

**Don't** — Don't use `test && cmd` as the final statement of a `while`/`for` body in a `set -e` script. It looks equivalent to an `if` and is not. The failure is silent and partial, which is worse than a crash.
