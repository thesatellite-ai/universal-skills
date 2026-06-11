---
name: satl-context-handoff
description: Produce a complete, self-contained context/handoff document that lets a future agent (or human) resume a task with zero knowledge loss. Use when the user asks to "create a full context", "write a handoff doc", "document everything you did", "create a runbook", "so the next agent misses nothing", or at the end of any multi-step task (migration, deployment, refactor, investigation, build-out) worth capturing.
---

# satl-context-handoff

Your job: turn everything you did and learned during a task into a **single self-contained document** so that handing that one file to a fresh agent (with no prior conversation) is enough for them to continue, reverse, or repeat the work without re-discovering anything. Optimise for "nothing is missed," not for brevity.

## Operating principles

- **Gather, don't guess.** Before writing, collect the real values from the source of truth — read the files, run the read-only commands, inspect the configs/logs you actually used. Never invent a path, name, port, or credential. If you can't verify something, say so explicitly rather than filling it in.
- **Mark verified vs assumed.** Distinguish what you directly did/confirmed from what someone else did or what you're inferring. A future agent must know which facts are load-bearing and which need re-checking on the live system.
- **State the single source of truth.** Note that if the doc ever disagrees with the live system, the live system wins — and the doc should be updated.
- **Capture the failures, not just the happy path.** The gotchas you hit and how you fixed them are the most valuable part; they're what a fresh agent would otherwise repeat.
- **Be honest about boundaries.** Record what you could NOT do / did NOT touch, so the next agent doesn't assume work happened that didn't (e.g. "I never had DB access; data restores were done by someone else").
- **Secrets:** if the doc must contain credentials, put a warning at the top, keep it local/uncommitted, and offer to also produce a redacted twin.

## Authoring rules

- **Never hard-wrap prose.** Every paragraph, bullet, table cell is ONE continuous line; let the renderer wrap. (Exceptions: code fences, table rows, YAML.)
- **Use tables for any inventory** (components, environments, credentials, mappings) — they scan fast and force completeness.
- **Use fenced code blocks for exact commands** so they're copy-pasteable.
- Write so a reader with zero context can follow it; expand acronyms and name things fully on first use.

## Document structure (adapt sections to the task; drop what doesn't apply)

Start with the title, a one-line **Purpose**, and (if needed) a **secrets warning**. Then:

0. **Who I am — the agent's role.** Short first-person intro: what role you played, the exact surface you operated on (tools/access), **what you can do**, and the **hard boundaries** (what you had no access to / didn't touch / was done by others). End with "how the next agent should use this file."
1. **TL;DR** — what happened, in a few sentences: the goal, the approach, the outcome.
2. **Environment / systems** — the systems involved (servers, services, accounts, environments), ideally old-vs-new or before-vs-after side by side.
3. **Inventory** — a table of the things being managed (apps, services, repos, datasets, endpoints…) with their key attributes.
4. **State / data details** — schemas, data locations, formats, mappings (e.g. old→new names), volumes/row counts, anything stateful.
5. **Credentials / access reference** — every key, token, password, host, path needed, old and new. (Behind the secrets warning.)
6. **Per-component mechanics** — where components differ in how they're built/configured/deployed. This is the easiest thing for the next agent to get wrong, so be explicit per component.
7. **The procedure** — the step-by-step you followed, generalized enough to repeat. Numbered, with the exact commands.
8. **Gotchas & fixes** — every trap hit, its symptom, root cause, and the fix. Numbered. This section earns its keep.
9. **What's still OPEN** — what is NOT done, known issues, things only verifiable on the live system, follow-ups.
10. **Reverse / rollback / repeat** — how to undo or redo the work (e.g. migrate back, roll back a deploy, re-run on another target), including what the target must provide first.
11. **Command cheat-sheet** — the handful of commands a future operator will actually retype, grouped by component if they differ.
12. **Locations / paths** — where the relevant repos, files, configs, and this doc itself live.

## Process

1. Confirm the **destination path** for the doc (default to the user's `~/Downloads` or a project docs dir; ask if unclear).
2. **Collect facts** by reading/inspecting the actual sources — don't rely on memory for exact values.
3. Draft the doc using the structure above, **omitting sections that don't apply** and adding task-specific ones as needed.
4. After writing, do a **completeness pass**: would a fresh agent with only this file be able to continue, reverse, and repeat the work? List anything still missing and either fill it or flag it under §9.
5. Tell the user the path, the section list, and flag (a) any secrets included and (b) any facts you marked "unverified / confirm on the live system."

## Quality bar

The doc passes if a brand-new agent, given only this file and no chat history, could resume the work, undo it, or run it again on a new target — and would hit none of the gotchas you already hit. If any of those isn't true, the doc isn't done.
