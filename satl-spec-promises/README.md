# satl-spec-promises

Every "never", "always" and "refuses" in a spec is a claim. This skill makes each one a tested claim, and installs a gate that fails the build the moment one is added without a test.

## Why it exists

A project with a careful spec and 100% statement coverage still shipped five promises that were false. A fork-PR guard failed open when it could not read its event file. A health check exited 0 while reporting a failure. A file from a newer version was read silently instead of refused. A class documented as "never reported" was reported. "Generated paths refuse minting" accepted a minted def. Each was a sentence in the spec; none was named by any test. Coverage said every line ran; it did not say any promise was checked.

The skill runs the sweep that finds those (every promise probed against the built artifact, with the probe itself proven able to fail) and then makes the gap impossible to reopen.

## What it ships

- `SKILL.md` — the method: inventory, classify, sweep, pin, break-verify, install the gate, report.
- `spec-promises` — a stdlib python3 CLI, usable from any language's project:
  - `scan SPEC...` lists every promise sentence with its line.
  - `init SPEC... --list FILE` writes a starter list.
  - `check --list FILE` fails on an unlisted promise, a reworded one, a `test` promise no test names as `promise:<id>`, or a test naming an id the list lacks.
- `test.sh` — the behavioural suite (`bash test.sh`); every failure mode of `check` is produced on purpose.

## The list format

```text
# spec: docs/SPEC.md
fork-never-runs	test	`run` and `resolve` are off by default and never run on fork PRs
author-advice	prose: advice to people writing docs	Never paste code.
```

`id <TAB> kind <TAB> quote`, where kind is `test` or `prose: <reason>`, and the quote is verbatim from the spec. Tests name the promise they pin with a `promise:<id>` comment.

## Requirements

Python 3.9 or later, standard library only. The spec must not be hard-wrapped: one line is one paragraph, bullet or table row.
