---
name: satl-features-registry
description: >-
  Keep a project's feature registry in sync with the code, atomically. Use in
  any repo that maintains a features list/page (e.g. a features.tsx/json
  registry) — when you build, ship, or change a feature, also patch the
  registry in the SAME turn. Triggers: building/shipping/changing a feature in
  a repo with a features registry; user prepends "[features] — <task>".
---

# satl-features-registry

When you build, ship, or change a feature in a repo that maintains a feature
registry, **update the registry in the same turn** — never a separate pass,
never "later".

## Procedure

1. Locate the registry (a `features.*` file: array/list of entries grouped by
   area). If the repo has none and the user expects one, ask where it lives.
2. Find the right group; create a new group only if none fit.
3. Add/update the entry: `{ title, description, status }`.
   - `status`: `live` (shipped & works), `in-progress` (partial / behind a
     flag), `planned` (discussed only — use freely so intent isn't lost).
   - Title ≤ 4 words. Description = one sentence; include the gesture/shortcut
     if relevant (e.g. `⌘K`).
4. Flip `planned → live` when shipped. Delete stale entries.
5. The registry page re-derives totals/counts — no other file needs touching.

## Rule

The build and the registry patch are **one atomic turn**. Shipping code
without the registry entry (or vice versa) is the failure mode this guards
against.
