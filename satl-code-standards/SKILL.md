---
name: satl-code-standards
description: >-
  The standing engineering bar for every code change — load BEFORE writing or
  editing code so the rules the user repeats every session are honored without
  being retyped. Enforces four universal pillars: full type safety, zero
  hardcoded strings for closed-set values, context-dense comments (so any new
  AI session or human picks up the code with no lost context), and
  modular/importable structure with no "AI slop". Language-agnostic and
  project-agnostic. For the concrete frontend/backend stack rules, it points to
  the project's own stack skills rather than hardcoding any library. Use when
  the user says "make it typesafe", "no hardcoded strings", "comment
  everything", "detailed comments", "organize this properly", "no AI slop",
  "make it importable / reusable across projects", "follow my standards", "the
  usual rules", or starts any non-trivial coding task. This skill is the source
  of truth for "how we write code here."
---

# satl-code-standards

## What this skill is

A standing-orders gate for code. The user gives the same instructions at the start of nearly every coding task — make it type-safe, no hardcoded strings, comment everything so a fresh AI session loses no context, organize it modularly so it can be imported across projects, and do not ship "AI slop." This skill encodes all of that in one place so it is applied by default instead of being re-stated each session.

It is deliberately **general** — no framework, no library, no specific stack. The rules here hold for any language and any project. Concrete, stack-specific rules (which UI library, which ORM, which query client) live in the project's own stack skills; this skill points to them (§3) rather than baking any library name in.

Read it BEFORE writing or editing code.

## When to invoke

- The user opens any coding task of substance, in any language.
- The user says any standing phrase: "typesafe", "no hardcoded strings", "comment everything / detailed comments", "organize properly", "no AI slop", "make it reusable / importable across projects", "the usual", "my standards".
- Before declaring code "done" — run the post-flight checklist (§2.2).

## NOT for

- Pure prose / docs / config edits with no code logic. (Markdown still follows the no-hard-wrap rule, but that is a global rule, not this skill.)
- Throwaway one-liners in a scratch file the user explicitly marks as throwaway.

---

## 0 · STEP 0 — Load the stack skills (BLOCKING — do this FIRST, before §1)

This skill is only the universal **floor**. The concrete, stack-specific rules — which data-fetching client, which ORM, which UI primitives, the exact "no inline GraphQL / use the generated SDK" kind of rule — live in **separate stack skills**. Skipping them is the #1 failure of this skill: you ship code that passes all four pillars yet violates a flat project rule, and nobody notices because the skip is silent.

**Before writing or editing ANY code**, for every language/area the task touches, load its stack skill:

1. **Detect** the languages/areas in the task (frontend TS/React, backend Go, CLI, infra, …).
2. **Find + load** the matching stack skill, in this order — stop at the first that hits:
   - the invocable-skills list — look for `ubgo-frontend` (TS/React), `ubgo-golang-v2` (Go), or a project-named stack skill, and invoke it;
   - a repo-pinned pointer (`CLAUDE.md`, `.aicoder/` / `.lore/` / `.codeskill/`) naming a stack rule doc — read it;
   - on disk: `~/.claude/skills/ubgo-frontend/`, `~/.claude/skills/ubgo-golang-v2/` (Read the `SKILL.md` + `frontend.md` / `golang.md` if it is not invocable as a Skill).
3. **Declare the result** — emit exactly one line before touching code: `Stack skills loaded: <names>` — or, if a language genuinely has none, `No stack skill found for <lang>`.

Do NOT write code until that line exists. The forced declaration is the whole point: a silent skip is the failure this step prevents — if you cannot emit the line, you have not done the step. When a stack skill and this floor disagree on a stack specific, the **stack skill wins**; the four pillars (§1) still apply on top.

---

## 1 · The four pillars — apply to EVERY change

These are non-negotiable regardless of language. They are the rules the user repeats most.

### 1.1 Full type safety — no escape hatches

- 100% type safety — zero escape hatches, no exceptions. BANNED outright: `any`, `as any`, `@ts-ignore`, `@ts-expect-error`, non-null `!` assertions used to dodge a real check (TS), naked `interface{}`/`any` (Go), and the equivalent in any typed language. There is no "just this once" with a comment — if you reach for one, stop and solve the type instead.
- If a shape is genuinely unknown, use the language's safe-unknown path (`unknown` in TS, a concrete type or generic in Go) and narrow explicitly with a type guard / schema parse. Never silence the checker.
- The ONLY acceptable place a runtime value crosses into the type system untyped is at a system boundary (network response, JSON parse, env var) — and there it MUST be validated through a schema/parser that returns a typed result. The `any`/`unknown` never leaks past that boundary line.
- Prefer the type system to runtime checks: discriminated unions, branded/opaque ID types so you can't pass the wrong id, exhaustive `switch` with a `never`/default-panic arm so adding a case is a compile error.
- The build IS the test for type safety. A change is not done until the type-checker / compiler passes clean (§3 has the per-stack command).

### 1.2 Zero hardcoded strings (and magic numbers) for closed-set values

- Any value with a closed set of choices — status, kind, role, scope, sort key, source, event name, cache-key prefix, route segment — gets a named constant/enum, defined once, referenced everywhere. Never a bare literal at the use site.
- Keep a canonical iteration list beside the constants (e.g. a `*Values` slice / an `*_OPTIONS` array / an `as const` union) so seeds, UI lists, and aggregations all read from one source — read and write paths never diverge.
- The test: grep your diff for string literals compared with `==`/`===` or used as `case` labels / map keys. Each one is either a named constant or a documented exception (free-form user text, or an upstream wire-format field name kept verbatim — translate INTO your constant, never rename the fixture).
- Magic numbers get the same treatment — a named constant or a design token, never `width: 387` / `timeout = 30000` inline.

### 1.3 Context-dense comments — so a fresh session loses nothing

The user's hardest requirement: any new AI session (or human) opening this code must understand *what it is, why it exists, and what not to break* without re-deriving it. Comments carry the context the code alone cannot.

- **Every exported/public function, type, and constant gets a doc comment** stating: what it does, *why it exists* (the non-obvious reason), and any invariant or gotcha a caller must respect. `// gets the user` adds nothing — comment intent and constraints, not mechanics.
- **Document multi-shape fields at the declaration.** If a field/column/payload/param can hold more than one shape depending on the writer, enumerate every shape in the comment right next to the declaration — no sidecar docs.
- **Document non-obvious framework/runtime rules where they are used**, not in a far-away README. ("Immutable but settable on create" goes in the schema comment.)
- **Explain the why for any workaround, ordering dependency, or "looks wrong but is intentional" block.** Otherwise a future editor "fixes" it and reintroduces the bug.
- Don't comment the obvious (`i++ // increment`). Density target: a reader who has never seen the file can answer "why does this exist and what breaks if I change it?" from the comments alone.

Example shape — note it carries *why* and *invariant*, not just *what*:

```
// ResolveTenant maps an inbound request to its owning tenant.
//
// Why it exists: tenancy is derived from the API-key prefix, NOT a header —
// headers are spoofable and are never trusted for authorization.
//
// Invariant: returns ErrNoTenant (never nil,nil) for anon-scoped keys —
// callers MUST branch on that rather than assume a tenant is always present.
```

### 1.4 Modular, importable, no AI slop

- Organize so a unit can be lifted into another project with minimal surgery: clear module/package boundaries, no hidden coupling to app-global singletons, dependencies injected not reached-for.
- One responsibility per file/module, named for what it owns. No 800-line "utils" grab-bag, no kitchen-sink components.
- Intentional public surface: export what callers need, keep the rest private; a curated index/barrel re-exports the surface.
- "AI slop" smells to avoid: dead scaffolding, copy-pasted near-duplicate blocks instead of a shared helper, generic names (`data`, `handleStuff`, `Manager`), commented-out code left in, inconsistent patterns within one file, and stubs that silently return empty (a data-returning stub must error or warn, never look like a real run on empty input).
- Reuse before rebuild: if a shared component/helper/wrapper already exists, extend it — do not hand-roll a local duplicate.

---

## 2 · Checklists

### 2.1 Pre-flight (before writing code)

- [ ] **STACK SKILLS LOADED (BLOCKING — §0)** — for every language/area I touch, its stack skill is loaded and I emitted the `Stack skills loaded: <names>` (or `No stack skill found for <lang>`) line. No code before that line. This is the item most often skipped and the one that catches stack-specific rules the four pillars cannot.
- [ ] **Shared resources** — grep every reader/writer of any field/column/table/env var/public API I will touch; list them `file:line`; confirm compatibility.
- [ ] **Constants** — every closed-set value I introduce has a named constant + a canonical iteration list. No bare literals at use sites.
- [ ] **Types** — every shape is expressed; no untyped escape hatch planned; opaque IDs branded.
- [ ] **Reuse** — does a shared component/helper already exist? Extend it; don't hand-roll a duplicate.
- [ ] **Empty / fallback path** — the zero/nil/missing case for every input has a defined graceful degradation (not a crash, not a silent zero).
- [ ] **Module boundary** — where does this live so it's importable elsewhere? Dependencies injected, not reached-for.

### 2.2 Post-flight (before saying "done")

- [ ] **Build passes** — the type-checker / compiler runs clean. Type safety is verified, not assumed.
- [ ] **Lint / format** — the project's linter + formatter clean.
- [ ] **Comments** — every new exported function/type/constant has a why-and-invariant doc comment; multi-shape fields documented at the declaration; every workaround explains itself.
- [ ] **Hardcoded-value grep** — diff has no bare closed-set literals and no magic numbers.
- [ ] **Run twice / inverse / lossy-diff** — idempotent on re-run; the opposite direction tested; every source field reached the destination or is documented as dropped.
- [ ] **Blast radius** — `git diff`; for each removed/renamed symbol, grep for callers.

---

## 3 · Stack-specific rules live elsewhere (loaded in §0)

This skill is the universal floor. The concrete stack rules — which UI primitives, which data-fetching client, which ORM, which logger, naming conventions, design tokens — are project-specific and change per repo. Do NOT hardcode any of them here; they live in the stack skills that §0 makes you load BEFORE writing code. This section is just the map of which skill covers what:

- **Frontend** (TypeScript / React / styling): **`ubgo-frontend`** — the canonical stack (TanStack Start + React + Base UI + Tailwind v4 + gqlkit) with hard rules like "no inline GraphQL — every query/mutation goes through the generated `src/generated/sdk` (gqlkit); raw `fetch()`/template-literal GraphQL is banned", `authFetch` on authed clients, the SSR-`localStorage` trap, semantic tokens. Plus any per-repo overlay (e.g. a `frontend-project.md`).
- **Backend** (Go / services): **`ubgo-golang-v2`** (or `ubgo-golang`) — the 3 commandments, reference tables over `field.Enum`, DB-as-dumb-storage, logging via `applog`/`ubgo/logger`, errors via `ubgo/errx`, multi-tenant safety, the anti-pattern catalog. Plus any per-repo overlay (e.g. a `golang-project.md`).
- If the repo has a knowledge store (`.aicoder/` / `.lore/` / `.codeskill/` or similar) or a `CLAUDE.md`, its rules are authoritative on conflict.

Names are the current defaults, not a closed set — a repo may pin its own stack skill; §0 step 2 finds it. When a stack skill and this floor disagree on a stack specific, the stack skill wins for that specific; the four pillars in §1 still apply on top.

A concrete miss this prevents (why §0 exists): shipping hand-written GraphQL query strings + a hand-rolled response type on a repo whose `ubgo-frontend` rule mandates the generated gqlkit SDK. It passes the four pillars (typed, no magic strings, commented) yet flatly violates the stack rule — invisible unless the stack skill was loaded first.

---

## Rules

- **FIRST, always: run §0** — load the stack skill(s) for the languages you touch and emit the `Stack skills loaded: …` line BEFORE any code. This is the gate; skipping it silently is the #1 way this skill fails.
- Apply the four pillars (§1) to every code change, in every language.
- The stack skill (loaded in §0) carries the concrete library/convention rules; this floor never names a library and defers to the stack skill on any stack specific.
- When a pillar is about to be violated, stop and ask — don't "just this once" it.
- Never auto-commit; the user reviews and decides each commit.
- Plain markdown, single physical line per paragraph (no hard-wrap). No reference to Claude / AI / Anthropic in any output.
