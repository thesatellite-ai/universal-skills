---
name: satl-spec-promises
description: >-
  Turn every absolute promise in a project's spec or README ("never", "always", "refuses", "must not", "deterministic") into a tested one, and install a gate that fails the build when a promise is added without a test, reworded without updating its list, or loses its test. Also runs the sweep that finds the promises that are already false: each one probed against the built artifact, not the source. Ships the `spec-promises` CLI (stdlib python3, any language). Use when the user says "we have a good spec but keep finding bugs", "why do we keep discovering new bugs", "make sure the spec is actually tested", "verify the promises", "audit the spec against the code", "catch every regression", "is this 100% working", "every never in the spec needs a test", when starting a project from a spec, before a first release, or after a bug that contradicted something the spec promised. NOT for writing the spec itself (satl-design-spec) or for general code review.
---

# satl-spec-promises

## What this skill is

A spec full of "never", "always" and "refuses" reads like a guarantee, and 100% statement coverage reads like proof. Neither is. Coverage says every line ran, not that any promise was checked; a spec sentence is checked only if some test asserts it, and nothing stops a new promise from being written with no test at all. This skill closes that gap twice: once by sweeping the promises that exist against the built artifact, and permanently by a gate that makes an untested promise fail the build.

It was built from one project where a well-written spec and 100% coverage still shipped five promises that were false: a fork-PR guard that failed open, a health check that exited 0 on a failure, a newer file format read silently instead of refused, a "never reported" class that was reported, and "generated paths refuse" when they accepted. Every one of them was a sentence in the spec that no test named.

## Why a good spec still ships bugs (tell the user this when they ask)

1. **Coverage measures lines, not promises.** A guard can be 100% covered by tests that never feed it the case the spec is about.
2. **Tests written in the same pass as the code share its blind spot.** Several tests asserted the bug: that a guard failed open, that a secret value appeared in output. A test that agrees with the code proves nothing about the spec.
3. **Bugs live between commands, over time, across repos.** Unit tests check one function; the failures were scan → edit → check → merge sequences.
4. **Fixtures look like the project's own code.** Real third-party code hits paths the author never wrote.
5. **Error branches return the convenient answer, not the safe one.** "Could not read the event file" became "not a fork"; "a row failed" still exited 0.
6. **Spec and code drift.** A behaviour changes; the sentence describing it does not; nobody re-checks either.
7. **"Done" is declared at the confidence wanted, not the confidence shown.** Each new way of looking found new bugs, because the looking had not been done.

## The CLI

`spec-promises` ships beside this file. Resolve it with a probe, never a hard-coded path:

```bash
SP=$(if [ -x "$HOME/.claude/skills/satl-spec-promises/spec-promises" ]; then echo "$HOME/.claude/skills/satl-spec-promises/spec-promises"; elif [ -x "$HOME/.config/claude/skills/satl-spec-promises/spec-promises" ]; then echo "$HOME/.config/claude/skills/satl-spec-promises/spec-promises"; elif command -v spec-promises >/dev/null 2>&1; then command -v spec-promises; fi)
[ -n "$SP" ] || echo "spec-promises not installed: run 'task install' in universal-skills, or use the copy beside this SKILL.md"
```

```bash
"$SP" scan  docs/SPEC.md README.md                 # every promise sentence, file:line<TAB>sentence
"$SP" init  docs/SPEC.md --list testdata/promises.txt   # starter list, one todo row per sentence
"$SP" check --list testdata/promises.txt           # exit 1 on any disagreement, 2 on a bad list
```

`check` fails when a promise sentence is not listed, a listed quote is no longer in the spec, a `test` promise has no test naming it as `promise:<id>`, or a test names an id the list does not have. Test files are found by the usual conventions (`*_test.go`, `test_*.py`, `*.test.ts`, `**/tests/**`, `scripts/**/*.sh`, …); `--tests GLOB` replaces them. Dependency and build directories are never searched.

## Flow

### Step 1 — Inventory

Run `scan` over every document that makes promises about the software: the spec, the README, `SECURITY.md`, CLI help text if it is in markdown. State the count to the user. A spec of any size has dozens; the docsync spec had 104.

### Step 2 — Classify, honestly

`init` writes one `todo-N  test  <sentence>` row per sentence. For each row decide:

- **`test`** — it describes what the software does. Give it a real id (`fork-never-runs`, `generated-no-mint`); several sentences stating one promise share one id.
- **`prose: <reason>`** — it is not a property of the software: advice to authors ("Never paste code"), a non-goal ("It never decides whether prose is true"), an example, a rationale, lineage. The reason is required and reviewed.

`prose` is never a way to skip a test. If a sentence describes behaviour and you cannot see how to test it, it is a `test` promise with a hard test, not prose.

### Step 3 — Sweep: probe every `test` promise against the built artifact

For each one, drive the real binary, service or package from outside, the way a user would, and record a verdict: **holds**, **broken**, or **not testable yet** (say why). Rules for the probe:

- **Prove the probe is sensitive** before trusting "holds": make the promise false (in a scratch copy, or by the setup) and watch the probe say so. A probe that produced one line of output, or ran in the wrong directory, passes on nothing.
- **Probe the error branches**, not just the happy path. For every guard ("never on forks", "refuses X"): what happens when the input is missing, unreadable, malformed, or empty? Each must give the *safe* answer. A guard whose error branch returns the permissive answer is broken, whatever its happy path does.
- **Probe across time and commands**: the same command twice, after an edit, after a merge, with an older and a newer version of the state file, from a subdirectory, with a path outside the project.
- **Probe with code that does not look like the project's own**: a real third-party repository or dataset, not only the fixtures.

When a probe finds a promise broken, decide which side is wrong. Usually the code: fix it. Sometimes the sentence overclaims (it said "never" where the truth is "never, where a grammar exists"): fix the spec, in the same change, to say exactly what is true. Never leave the two disagreeing, and never weaken a test to make it agree with the code.

### Step 4 — Pin: every `test` promise gets a test that names it

- Tag the test that actually asserts the promise: a `promise:<id>` comment on the line above it (`// promise:fork-never-runs`, `# promise:…` in a shell matrix). Several ids may share a line.
- Tag only a test you have read and confirmed asserts it. The gate checks that the link exists, not that it is honest; a tag on a test that merely runs the code path is a lie the gate cannot see.
- A promise that holds still needs a test. "Holds today" is exactly what regresses silently tomorrow.
- A behaviour that spans commands or runs gets an end-to-end case against the built artifact, not only a unit test.

### Step 5 — Break-verify every new test and the gate itself

A test is evidence only once it has been seen to fail. For each one: back up the file (`cp f /tmp/f.bak`), break the code it guards, run the test, watch it fail with a message that names the problem, restore from the backup. **Never restore with `git checkout` / `git restore`** — they revert to the last commit and destroy every uncommitted change in the file.

Break the gate four ways too: add an unlisted "never" sentence to the spec, reword a listed one, remove a test's only tag, typo a tag. Each must fail `check`.

### Step 6 — Install the gate in the standard check

Add `spec-promises check --list <file>` (or the project's native equivalent, see below) to the one command everyone runs before calling work done — `task`, `make check`, `npm test`. It must be part of the default gate, not a separate command someone remembers. Record the rule in the project's `CLAUDE.md` / `AGENTS.md`: "writing a promise into the spec means listing it and writing the test, in the same change."

For CI, follow the user's budget rules: never add a push- or PR-triggered workflow without asking; the local gate is the real one.

### Step 7 — Report

Give the user a verdict per promise group: what held (and is now pinned), what was broken and fixed (with the failure it would have caused), what was an overclaim fixed in the spec, and anything left not testable with the reason. Then the gate: what it now refuses. Do not say "everything works"; say what was checked and how.

## Native gate (optional)

The CLI works in any language. A project may prefer the gate inside its own test runner so it runs with the unit tests; the logic is small enough to port — the docsync repository's `promises_test.go` is a Go implementation of exactly the four checks above. Keep the list format identical so the CLI and the native test can cross-check each other.

## Companion gates worth adding in the same pass

- **Fixed issues:** a list of closed bug numbers, and a test that fails for any number no test references (`(#N)`). A fixed bug with no named test regresses silently.
- **A leak sweep:** if the spec says a value is never shown (a secret, a token, PII), one script that runs every command that prints anything over a fixture holding a sentinel value, in each state (clean, changed, changed and saved), and fails if the sentinel appears. A new command that prints is a new place to leak; the script is the list to extend.
- **A boundary test over the source:** if the spec says a module never imports X or never writes files, parse the source (not a line regex, which multi-line import blocks defeat) and fail on the forbidden imports.

## NOT for

- Writing or restructuring the spec (use `satl-design-spec`).
- A project with no written promises: there is nothing to pin. Suggest writing the invariants down first.
- Line-level code review (use a code-review skill).

## Gotchas

- **The spec must not be hard-wrapped.** The tool treats one line as one paragraph, bullet or table row; a sentence broken across lines is checked in pieces and its quote will not match.
- **Quotes are verbatim.** Copy them from the spec; a typographic quote or a doubled space is a different string.
- **Section references rot.** When a test comment cites "§17", check the number against the spec's headings; a wrong reference misleads the next reader.
- **An empty list, an unreadable list, or no spec named is an error (exit 2), never a pass.**
