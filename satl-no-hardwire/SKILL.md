---
name: satl-no-hardwire
description: >-
  Never hard-wire one model where users will need many. Use when designing or
  reviewing anything that embodies a policy or model (permissions and roles,
  storage, identity sources, ID formats, delivery channels, encryption keys,
  rate limiting, error formats, UI templates, pricing, workflow, scheduling),
  when the user says "hardwired", "pluggable", "make it swappable", "what if a
  user wants X instead", or asks to audit a codebase for hard-wires. Adopts the
  rule into the project, runs a read-only audit with file:line findings ranked
  by who they block, then fixes only what the user picks — default behaviour
  unchanged, tests proven by breaking the code.
---

# satl-no-hardwire

A library or app that hard-wires one model serves only the users who happen to fit it. Everyone else forks it, wraps it badly, or leaves. This skill makes "which models will real users bring?" a question asked before the first type is written, and gives a repeatable audit for code that already exists.

## The rule

Before building anything that embodies a policy or a model, list the realistic ways different users solve that problem. For authorization, for example: simple roles, RBAC, ABAC, relationship-based (Zanzibar, OpenFGA, SpiceDB), policy engines (Casbin, OPA, Cedar), per-tenant custom rules. Then make every caller depend on a small interface that asks the question ("may X do Y on Z?"), with our implementation as the default and every other model pluggable through one typed option. **Our built-in is one implementation, never the contract.**

- **The test:** if one feature imports another feature's concrete type to make a decision, that is a hard-wire. Replace it with an interface, injected or discovered.
- **Shape of the seam:** optional upgrade interfaces over required config; a request struct over bare arguments, so fields can be added without breaking implementers; errors fail closed (an error with a "yes" is still a "no").
- **Not hard-wires:** deliberate security floors stay fixed (constant-time comparisons, safe defaults, refusing unsafe linking). Say so explicitly when excluding them.
- **Fix the class:** when one weakness is found, sweep for every instance of the same shape, not just the one pointed at.
- **Do not over-abstract:** a seam earns its place when a realistic second model exists. A value with exactly one sane implementation stays concrete.

## Modes

### adopt — save the rule into the project

Write the rule where the project keeps agent rules (CLAUDE.md, AGENTS.md, `.cursor/rules`, project memory), adapted to this codebase: name its real policy areas and, if one is known, its first hard-wire as the example. One line on why. Never hard-wrap markdown.

### audit — read-only, edit nothing

Find every hard-wire:

- a feature importing another feature's concrete type to make a decision;
- fixed policies with no override: hashing, token and ID formats, code generation, delivery, rate-limit keys and algorithm, storage engines and column types, caching, clock, randomness, client IP extraction, origin checks, identity source, roles and membership models, invitation addressing, audit sinks and their read side, encryption keys and KMS, HTTP error envelope, UI templates;
- closed sets users would want to extend: role names, providers, scopes, event types;
- places where comparable libraries let users override and this one does not;
- code that bypasses an existing seam (calls `time.Now()` despite an injectable clock, reads an env var despite a config option).

Also list the seams that already exist, so they are not re-reported, and the deliberate floors excluded and why.

Report each finding as: `file:line`, what is hard-wired, which real user setups it blocks (concrete examples, not "some users"), severity, and a one-line suggested seam. Group by severity:

| Severity | Meaning |
|---|---|
| Blocks a class | A whole category of users cannot use the feature at all |
| Inconvenient | Workable with wrappers or forks, but they should not have to |
| Cosmetic | Rare need, or a missing override with an easy workaround |

Plain language, no padding. Findings that need a product decision rather than a fix (for example, a seam that would break a promise the project makes) are marked as such, not silently fixed.

### fix — only what the user picked

Stop after the audit and wait for the user's choice. Then, for each picked finding:

1. Introduce the interface and one typed option; the current behaviour becomes the default implementation, unchanged.
2. Tests: custom allow, custom deny, custom error fails closed, default unchanged. Where the old and new paths should agree, a randomized equivalence test.
3. Prove each new test by breaking the code and watching it fail, then restore from a copy taken before the break (never `git checkout`/`git restore` on a dirty tree).
4. Docs beside the feature: the option, the interface, and one example of plugging in a different model.
5. Run the full test suite before saying done. No lint or test suppressions. Do not commit or push without asking.

Split the fixes so each file has one owner when several agents work in parallel.

## Output back to the user

Audit: counts per severity, then the grouped findings. Fix: what changed per finding, test and gate results, any public API that changed shape, and anything deferred.
