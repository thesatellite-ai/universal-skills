# satl-code-standards — purpose & use case

## Why this skill exists

The user gives the same instructions at the start of nearly every coding task — make it type-safe, no hardcoded strings, comment everything so a fresh AI session loses no context, organize it modularly so it can be imported across projects, and don't ship "AI slop." Re-typing those standing orders every session is friction, and the moment one is forgotten the code drifts off the bar.

`satl-code-standards` encodes all of it in one place so the standards are applied **by default** instead of being re-stated each time. It is the source of truth for "how we write code here."

## What it does

Acts as a standing-orders gate, read BEFORE writing or editing code. It enforces four universal pillars on every change:

1. **Full type safety** — zero escape hatches (`any`, `as any`, `@ts-ignore`, naked `interface{}`, etc.). Untyped values only cross at a system boundary, validated through a schema.
2. **Zero hardcoded strings / magic numbers** for closed-set values — status, kind, role, route segment all get a named constant defined once, referenced everywhere.
3. **Context-dense comments** — so any new AI session or human picks up the code with no lost context.
4. **Modular, importable structure** — no AI slop.

It is deliberately **language- and framework-agnostic**. Concrete stack rules (which UI library, which ORM) live in the project's own stack skills; this skill points to them rather than baking any library name in.

## When to use it

- Any coding task of substance, in any language — load it first.
- The user says any standing phrase: "typesafe", "no hardcoded strings", "comment everything", "no AI slop", "make it reusable / importable", "the usual", "my standards".
- Before declaring code "done" — run its post-flight checklist.

## NOT for

- Pure prose / docs / config edits with no code logic.
- Throwaway one-liners the user explicitly marks as scratch.
