# satl-oss-scaffold — purpose & use case

## Why this skill exists

Every public repo needs the same set of "good citizen" files — a license, contribution guide, changelog, code of conduct, security policy, issue/PR templates. GitHub even scores a repo's *community profile* on whether they're present. But writing them by hand is tedious and easy to get subtly wrong: the license ends up with the wrong year or owner, the CHANGELOG never gets created, the code of conduct ships with a placeholder email, the `.github/` templates are missing entirely.

`satl-oss-scaffold` drops in correct, consistent versions of all of them, filled from `brand.json`, so no project ships half-dressed.

## What it writes

- **LICENSE** — Apache-2.0 by default (full text included), copyright filled from the manifest.
- **CONTRIBUTING.md** — setup, branch/commit conventions, a PR checklist.
- **CHANGELOG.md** — Keep a Changelog + SemVer, seeded with `[Unreleased]`.
- **CODE_OF_CONDUCT.md** — Contributor Covenant 2.1 with a real enforcement contact.
- **SECURITY.md** — private disclosure path + supported versions.
- **`.github/`** — bug + feature issue templates, `config.yml`, PR template, `FUNDING.yml`.
- **.editorconfig / .gitattributes** — consistent whitespace + line endings.
- **llms.txt** — the AI-era discoverability manifest, so ChatGPT/Perplexity/Claude can index the project correctly.

## When to use it

- **"Add an Apache license / CONTRIBUTING / CHANGELOG / code of conduct / SECURITY."**
- **"Set up the `.github` templates."**
- **"Make this repo open-source ready."**
- A repo that's about to go public and needs the whole community-files pass.

## How it's careful

- **Fills every placeholder** from `brand.json` (`{{NAME}}`, `{{REPO}}`, `{{YEAR}}`, `{{AUTHOR}}`, `{{EMAIL}}`, …) and greps the output to make sure none leaked.
- **Doesn't clobber** an existing CHANGELOG or LICENSE — it preserves entries and warns on a license mismatch.
- **Requires a real contact** for the CoC and SECURITY files (no placeholder emails shipped).
- **Keeps license metadata consistent** across `brand.json`, `LICENSE`, and `go.mod`/`package.json`/`Cargo.toml`.

## Scope boundary

This skill stops at community/hygiene files. Release automation (GoReleaser, Homebrew tap, install scripts, CI) is related but separate — copy a working setup from an existing repo when you need it.
